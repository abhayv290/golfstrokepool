'use server'

import { uploadToCloudinary } from "@/lib/cloudinary"
import { connectDB } from "@/lib/db"
import { formatINR } from "@/lib/drawEngine"
import { getAuthUser } from "@/lib/session"
import { MatchType } from "@/models/Draw"
import Winner from "@/models/Winner"
import { ActionResult } from "@/types/auth"
import { WinnerClient, WinnerStatus } from "@/types/draw"
import { revalidatePath } from "next/cache"

interface IWinnerClient extends Omit<WinnerClient, 'userName' | 'userEmail'> {
    drawDate: string
    reviewedAt?: string
    paidAt?: string
    adminNote?: string
    proofUrl?: string

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
        const wn = await Winner.findById({ _id: id, userId: user.userId })
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
                paidAt: wn.paidAt?.toISOString(),
                proofUrl: wn.proofUrl,
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
    const winnerId = formdata.get('winnerId') as string
    if (!winnerId) return {
        error: true, message: 'Winner Id is required'
    }
    const file = formdata.get('proof') as File | null

    if (!file || file.size === 0) return {
        error: true, message: 'Please select a file to upload'
    }

    //Validate file type 
    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
        return { error: true, message: 'Only JPG,JPEG ,PNG and WepP images are accepted' }
    }

    //Validate file size (max 5mb)
    if (file.size > 5 * 1024 * 1024) {
        return { error: true, message: 'File must be under 5 MB' }
    }
    try {
        await connectDB()
        //Verify the winner 
        const winner = await Winner.findById({ _id: winnerId, userId: user.userId })
        if (!winner) return { error: true, message: 'Winner Not Found' }

        if (['approved', 'paid'].includes(winner.status)) {
            return { error: true, message: 'This winner has already has been approved' }
        }

        //Covert File  to Buffer for Cloudinary upload 
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        //Upload - folder : winner-proofs  filename : winnerId so it's deterministic 

        const proofUrl = await uploadToCloudinary(buffer, {
            folder: 'winner-proofs',
            filename: `${winnerId}-${user.userId}`,
            allowedFormat: ['jpg', 'jpeg', 'png', 'webp'],
            maxBytes: 5 * 1024 * 1024,
        })


        //Upload winner record 
        await Winner.findByIdAndUpdate(winnerId, {
            proofUrl, status: 'proof_submitted', proofUploadedAt: new Date(),
        })

        revalidatePath('dashboard/winners')
        revalidatePath('admin/winners')

        return { error: false, message: 'File Uploaded' }
    } catch (err) {
        console.error('WinningProofAction', err)
        return { error: true, message: 'Error Uploading Proof Documents' }
    }
}