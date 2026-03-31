'use server'

import { connectDB } from "@/lib/db"
import { getAuthUser } from "@/lib/session"
import Score from "@/models/Score"
import { ActionResult } from "@/types/auth"
import { revalidatePath } from "next/cache"


const MAX_SCORES = 5

export interface ScoreEntry {
    _id: string
    value: string
    datePlayed: string
}

export async function getScoreAction(): Promise<ActionResult<ScoreEntry[]>> {
    const auth = await getAuthUser()
    if (!auth) {
        return { error: true, message: 'Not Authenticated' }
    }
    try {
        await connectDB()
        const scores = await Score.find({ userId: auth.userId }).sort({ datePlayed: -1 }).lean()
        return {
            error: false, message: "Score fetched",
            data: scores.map(s => ({
                _id: s._id.toString(), value: s.value, datePlayed: s.datePlayed.toISOString()
            }))
        }
    } catch (err) {
        console.error('Score', err)
        return { error: true, message: 'Something went Wrong' }
    }
}


//Add new Score 
//If user have more than 5 score already , delete the oldest one

export async function addScoreAction(formdata: FormData): Promise<ActionResult<ScoreEntry[]>> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Not Authenticated' }

    const valueRaw = Number(formdata.get('value'))
    const dateRaw = formdata.get('datePlayed') as string

    //validation 
    if (!valueRaw || valueRaw < 1 || valueRaw > 45 || !Number.isInteger(valueRaw)) {
        return { error: true, message: 'Score must be a whole number between 1-45' }
    }

    const datePlayed = new Date(dateRaw)
    if (isNaN(datePlayed.getTime())) {
        return { error: true, message: 'Invalid Date' }
    }
    if (datePlayed > new Date()) {
        return { error: true, message: 'Date cannot set in future' }
    }

    try {
        await connectDB()
        //Rolling - If have 5 and adding a new one , delete the oldest 
        const count = await Score.countDocuments({ userId: auth.userId })
        if (count >= MAX_SCORES) {
            const oldest = await Score.findOne({ userId: auth.userId }).sort({ datePlayed: 1 })
            if (oldest) await Score.deleteOne({ _id: oldest._id })
        }
        await Score.create({
            userId: auth.userId,
            value: valueRaw,
            datePlayed
        })
        revalidatePath('/dashboard/scores')

        return getScoreAction()
    } catch (err) {
        console.error('AddScore', err)
        return { error: true, message: 'Failed to Save Score' }
    }
}


//Edit a Existing Score 
export async function editScoreAction(formdata: FormData): Promise<ActionResult<ScoreEntry[]>> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Not Authenticated' }

    const scoreId = formdata.get('scoreId') as string
    const valueRaw = Number(formdata.get('value'))
    const dateRaw = formdata.get('datePlayed') as string

    //validation 
    if (!scoreId) return { error: true, message: 'ScoreId required' }
    if (!valueRaw || valueRaw < 1 || valueRaw > 45 || !Number.isInteger(valueRaw)) {
        return { error: true, message: 'Score must be a whole number between 1-45' }
    }

    const datePlayed = new Date(dateRaw)
    if (isNaN(datePlayed.getTime())) {
        return { error: true, message: 'Invalid Date' }
    }
    if (datePlayed > new Date()) {
        return { error: true, message: 'Date cannot set in future' }
    }

    try {
        await connectDB()
        const score = await Score.findOne({ userId: auth.userId, _id: scoreId })
        if (!score) return {
            error: true, message: 'Score not Found'
        }
        score.value = valueRaw
        score.datePlayed = datePlayed
        await score.save()

        revalidatePath('/dashboard/scores')
        return getScoreAction()
    } catch (err) {
        console.error('EditScore', err)
        return { error: true, message: 'Error Updating Score Data' }
    }
}

//Delete a Score
export async function deleteScoreAction(scoreId: string): Promise<ActionResult<ScoreEntry[]>> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Not Authenticated' }
    if (!scoreId) return { error: true, message: 'ScoreId is Required' }
    try {
        await connectDB()
        await Score.findOneAndDelete({ _id: scoreId, userId: auth.userId })

        revalidatePath('/dashboard/scores')
        return getScoreAction()
    } catch (error) {
        console.error('DeleteScore', error)
        return { error: true, message: 'Error Deleting Score data' }
    }
}