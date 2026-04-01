'use server'

import { connectDB } from "@/lib/db"
import { formatINR } from "@/lib/drawEngine"
import { getAuthUser } from "@/lib/session"
import { MatchType } from "@/models/Draw"
import Winner from "@/models/Winner"
import { ActionResult } from "@/types/auth"
import { WinnerClient, WinnerStatus } from "@/types/draw"

interface IWinnerClient extends Omit<WinnerClient, 'userName' | 'userEmail'> {
    drawDate: string
    reviewedAt?: string
    paidAt?: string
    adminNote?: string

}
export async function getUsersWinningsAction(): Promise<ActionResult<IWinnerClient[]>> {
    const user = await getAuthUser()
    if (!user) return { error: true, message: 'Unauthorized' }
    try {
        await connectDB()

        const wins = await Winner.find({ userId: user.userId }).sort({ createdAt: -1 }).lean()
        return {
            error: false, message: '', data: wins?.map(w => ({
                _id: w._id.toString(),
                userId: w.userId.toString(),
                matchedNumbers: w.matchedNumbers,
                status: w.status as WinnerStatus,
                prizeAmount: w.prizeAmount,
                matchType: w.matchType as MatchType,
                prizeFormatted: formatINR(w.prizeAmount),
                drawDate: w.createdAt.toISOString()
            }))
        }

    } catch (err) {
        console.error('UserWinningsAction', err)
        return { error: true, message: 'Failed to fetch winnings' }
    }
}

export async function getWinnerDetails(id: string): Promise<ActionResult<IWinnerClient>> {
    const user = await getAuthUser()
    if (!user) return { error: true, message: 'UnAuthenticated' }

    try {
        await connectDB()
        const wn = await Winner.findById(id)
        if (!wn) return { error: true, message: 'No Wins Found' }

        return {
            error: false, message: '', data: {
                _id: wn._id.toString(),
                userId: wn.userId.toString(),
                matchType: wn.matchType as MatchType,
                status: wn.status as WinnerStatus,
                matchedNumbers: wn.matchedNumbers,
                prizeAmount: wn.prizeAmount,
                prizeFormatted: formatINR(wn.prizeAmount ?? 0),
                drawDate: wn.createdAt.toISOString(),
                adminNote: wn.adminNote ?? '',
                reviewedAt: wn.reviewedAt?.toISOString(),
                paidAt: wn.paidAt?.toISOString()
            }
        }

    } catch (err) {
        console.error('GetWinnerDetail', err)
        return { error: true, message: 'Error fetching win detail' }
    }
}


export async function uploadWinningProofAction(formdata: FormData): Promise<ActionResult> {
    const user = await getAuthUser()
    if (!user) return {
        error: true, message: 'UnAuthenticated'
    }

    try {
        return { error: false, message: 'File Uploaded' }
    } catch (err) {
        console.error('WinningProofAction', err)
        return { error: true, message: 'Error Uploading Proof Documents' }
    }
}