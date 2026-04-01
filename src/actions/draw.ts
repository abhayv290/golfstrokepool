'use server'

import { connectDB } from "@/lib/db";
import { formatINR, getPrizeContributionPaise, runDraw } from "@/lib/drawEngine";
import { getAuthUser } from "@/lib/session";
import Draw, { DrawMode, IDraw } from "@/models/Draw";
import Score from "@/models/Score";
import User from "@/models/User";
import { DrawResultClient, DrawSummary, WinnerClient, WinnerStatus } from "@/types/draw";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/types/auth";
import Winner from "@/models/Winner";

//Helper function to build subscriber list from db 
async function getActiveSubscribers() {
    const users = await User.find({ subscriptionStatus: 'active' }).lean()
    const subs = await Promise.all(
        users.map(async (user) => {
            const scores = await Score.find({ userId: user._id }).sort({ datePlayed: -1 }).limit(5).lean()
            return {
                userId: user._id.toString(),
                scores: scores.map((s) => s.value),
                // Average plan contribution — use monthly as default
                prizeContribution: getPrizeContributionPaise('monthly')
            }
        })
    )
    return subs
}


//Helper function get current month's draw or create if does not exists 

async function getOrCreateCurrentDraw() {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevDraw = await Draw.findOne({ month: prevMonth, year: prevYear }).lean()
    const jackpotCarriedOver = prevDraw?.jackpotRolledToNext ? prevDraw.prizePool?.five ?? 0 : 0

    const draw = await Draw.findOneAndUpdate({ month, year }, {
        $setOnInsert: {
            month, year, status: 'pending', drawnNumbers: [], jackpotCarriedOver,
        },
    }, { upsert: true, returnDocument: "after" })
    return draw
}



//Simulate Draw 
//Runs the draw engine and saves result  as simulated NOT published to users 

export async function simulateDrawAction(mode: DrawMode): Promise<ActionResult<{ draw: DrawResultClient, winners: WinnerClient[] }>> {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') return {
        error: true, message: 'Admin Access Required'
    }
    try {
        await connectDB()

        const draw = await getOrCreateCurrentDraw()
        if (draw.status === 'published') {
            return { error: true, message: 'This month\'s draw has already been published' }
        }

        const subs = await getActiveSubscribers()
        if (!subs.length) {
            return { error: true, message: 'No Active Subscriber to run draw for' }
        }
        const prizePerSubscriber = getPrizeContributionPaise('monthly')

        const summary: DrawSummary = runDraw({
            mode,
            subscribers: subs.map(s => ({ userId: s.userId, scores: s.scores }))
            , jackpotCarryover: draw.jackpotCarriedOver
            , prizePerSubscriber
        })
        //Save Simulated Results  status stays 'simulated' not published yet
        const updated = await Draw.findByIdAndUpdate(draw._id, {
            drawnNumbers: summary.drawnNumbers,
            mode: summary.mode,
            status: 'simulated',
            prizePool: summary.prizePool,
            jackpotRolledToNext: summary.jackpotRolledToNext,
            subscriberCountAtDraw: subs.length
        }, { returnDocument: 'after' })

        if (!updated) return { error: true, message: 'Failed on Simulation' }

        //Build Winner preview (not saved to Winner collection yet)
        const winnerPreview: WinnerClient[] = await Promise.all(
            summary.winners.map(async (w) => {
                const user = await User.findById(w.userId).lean()
                return {
                    _id: '',
                    userId: w.userId,
                    userName: user.name ?? 'Unknown',
                    userEmail: user?.email ?? '',
                    matchType: w.matchType,
                    matchedNumbers: w.matchedNumbers,
                    prizeAmount: w.prizeAmount,
                    prizeFormatted: formatINR(w.prizeAmount),
                    status: 'preview' as WinnerStatus
                }
            })
        )
        revalidatePath('/admin/draws')

        return {
            error: false, message: 'Winner Selected', data: {
                draw: serializeDraw(updated),
                winners: winnerPreview
            }
        }

    } catch (err) {
        console.error('Simulate Draw Action', err)
        return { error: true, message: 'Error Simulating Draw Action' }
    }

}

//Publish Draw Results
//Saves winners to DB , set Status to published visible to subscribers

export async function publishDrawAction(): Promise<ActionResult<{ draw: DrawResultClient, winners: WinnerClient[] }>> {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') return { error: true, message: 'Admin Access Required' }

    try {
        await connectDB()

        const now = new Date()
        const draw = await Draw.findOne({
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            status: 'simulated', //must simulate before publishing 
        })
        if (!draw) {
            return { error: true, message: 'No simulation found for this month , Run a simulation first' }
        }

        const subs = await getActiveSubscribers()

        const { checkAllMatches, calculatePayouts } = await import('@/lib/drawEngine')

        const matches = checkAllMatches(
            subs.map(s => ({ userId: s.userId, scores: s.scores })), draw.drawnNumbers
        )
        const { payouts, jackpotRolledToNext } = calculatePayouts(matches, draw.prizePool)
        // Upsert winner documents — run sequentially to avoid unique index races
        // (parallel Promise.all can cause duplicate key errors on userId+drawId index)
        const winnerDocs = []
        for (const payout of payouts) {
            try {
                const doc = await Winner.findOneAndUpdate(
                    { userId: payout.userId, drawId: draw._id },
                    {
                        userId: payout.userId,
                        drawId: draw._id,
                        matchType: payout.matchType,
                        matchedNumbers: payout.matchedNumbers,
                        prizeAmount: payout.prizeAmount,
                        status: 'pending',
                    },
                    { upsert: true, returnDocument: 'after', runValidators: true }
                )
                if (doc) {
                    winnerDocs.push(doc)
                } else {
                    console.warn('[publishDraw] upsert returned null for userId:', payout.userId)
                }
            } catch (upsertErr) {
                // Log but don't abort the whole publish for one failed winner
                console.error('[publishDraw] upsert error for userId:', payout.userId, upsertErr)
            }
        }
        //Mark Draw as Published 
        const published = await Draw.findByIdAndUpdate(draw._id, {
            status: 'published', jackpotRolledToNext, publishedAt: new Date(),
        }, { returnDocument: 'after' })

        if (!published) return { error: true, message: 'Failed to Publish Draw' }

        // Build winner response
        const winnerClients: WinnerClient[] = await Promise.all(
            winnerDocs.map(async (w) => {
                const user = await User.findById(w.userId).lean()
                return {
                    _id: w._id.toString(),
                    userId: w.userId.toString(),
                    userName: user?.name ?? 'Unknown',
                    userEmail: user?.email ?? '',
                    matchType: w.matchType,
                    matchedNumbers: w.matchedNumbers,
                    prizeAmount: w.prizeAmount,
                    prizeFormatted: formatINR(w.prizeAmount),
                    status: w.status,
                }
            })
        )

        revalidatePath('/admin/draws')
        revalidatePath('/dashboard/draws')

        return {
            error: false, message: 'Draw Published',
            data: {
                draw: serializeDraw(published),
                winners: winnerClients,
            },
        }
    } catch (err) {
        console.error('Publish Draw', err)
        return { error: true, message: 'Error Publishing Draw ' }
    }
}

//GET current month Draw 
export async function getCurrentDrawAction(): Promise<ActionResult<{ draw: DrawResultClient | null, winners: WinnerClient[] }>> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Not Authenticated' }

    try {
        await connectDB()
        const now = new Date()
        const draw = await Draw.findOne({
            month: now.getMonth() + 1,
            year: now.getFullYear(),
        }).lean()

        if (!draw) {
            return { error: false, message: 'No draw', data: { draw: null, winners: [] } }
        }
        //Only show winners to admin if published
        const showWinners = auth.role === 'admin' || draw.status === 'published'
        let winners: WinnerClient[] = []
        if (showWinners && draw.status !== 'pending') {
            const winnerDocs = await Winner.find({ drawId: draw._id }).lean()
            winners = await Promise.all(
                winnerDocs.map(async (w) => {
                    const user = await User.findById(w.userId).lean()
                    return {
                        _id: w._id.toString(),
                        userId: w.userId.toString(),
                        userName: user?.name ?? 'Unknown',
                        userEmail: user?.email ?? '',
                        matchType: w.matchType as 'five' | 'four' | 'three',
                        matchedNumbers: w.matchedNumbers,
                        prizeAmount: w.prizeAmount,
                        prizeFormatted: formatINR(w.prizeAmount),
                        status: w.status,
                    }
                })
            )
        }
        return { error: false, message: '', data: { draw: serializeDraw(draw), winners } }

    } catch (err) {
        console.error('CurrentDraw', err)
        return { error: true, message: 'Some Error Occurred Fetching Current month draw' }
    }
}


//GEt Past Draw (Published)
export async function getPastDrawsAction(): Promise<ActionResult<DrawResultClient[]>> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Not Authenticated' }

    try {
        await connectDB()

        const draws = await Draw.find({ status: 'published' }).sort({ year: -1, month: -1 }).limit(10).lean()

        return { error: false, message: 'Past Draws', data: draws.map(d => serializeDraw(d)) }
    } catch (err) {
        console.error('getPastDraws', err)
        return { error: true, message: 'Not Authenticated' }
    }
}

// ─── Serializer — converts Mongoose doc to plain client-safe object ───────────

function serializeDraw(draw: IDraw): DrawResultClient {
    return {
        _id: draw._id.toString(),
        month: draw.month,
        year: draw.year,
        drawnNumbers: draw.drawnNumbers ?? [],
        mode: draw.mode,
        status: draw.status,
        prizePool: {
            total: draw.prizePool?.total ?? 0,
            five: draw.prizePool?.five ?? 0,
            four: draw.prizePool?.four ?? 0,
            three: draw.prizePool?.three ?? 0,
        },
        jackpotCarriedOver: draw.jackpotCarriedOver ?? 0,
        jackpotRolledToNext: draw.jackpotRolledToNext ?? false,
        subscriberCountAtDraw: draw.subscriberCountAtDraw ?? 0,
        publishedAt: draw.publishedAt?.toISOString(),
        totalFormatted: formatINR(draw.prizePool?.total ?? 0),
        fiveFormatted: formatINR(draw.prizePool?.five ?? 0),
        fourFormatted: formatINR(draw.prizePool?.four ?? 0),
        threeFormatted: formatINR(draw.prizePool?.three ?? 0),
    }
}