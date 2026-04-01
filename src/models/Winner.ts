import { Document, model, models, Schema, Types } from 'mongoose'
import { MatchType } from './Draw'
import { WinnerStatus } from '@/types/draw'


export interface IWinner extends Document {
    _id: Types.ObjectId
    userId: Types.ObjectId
    drawId: Types.ObjectId
    matchType: MatchType
    matchedNumbers: number[]
    prizeAmount: number
    status: WinnerStatus
    proofUrl: string
    proofUploadedAt: Date
    adminNote: string
    reviewedBy: Types.ObjectId
    reviewedAt: Date
    paidAt: Date
    createdAt: Date
    updatedAt: Date
}

const WinnerSchema = new Schema<IWinner>(
    {
        userId: {
            type: Schema.Types.ObjectId, ref: 'User', required: true, index: true,
        },
        drawId: {
            type: Schema.Types.ObjectId, ref: 'Draw', required: true, index: true,
        },
        matchType: {
            type: String, enum: ['five', 'four', 'three'], required: true,
        },
        matchedNumbers: { type: [Number], required: true, },
        prizeAmount: {
            type: Number, required: true, min: 0,
        },
        status: {
            type: String, default: 'pending',
            enum: ['pending', 'proof_submitted', 'approved', 'rejected', 'paid'],
        },
        proofUrl: String,
        proofUploadedAt: Date,
        adminNote: String,
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: Date,
        paidAt: Date,
    },
    { timestamps: true }
)

// One winner entry per user per draw (a user can only win one tier per draw)
WinnerSchema.index({ userId: 1, drawId: 1 }, { unique: true })
WinnerSchema.index({ status: 1 })
WinnerSchema.index({ drawId: 1, matchType: 1 })

const Winner = models.Winner<IWinner> || model<IWinner>('Winner', WinnerSchema)

export default Winner