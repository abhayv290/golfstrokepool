import { model, models, Schema } from 'mongoose'


const WinnerSchema = new Schema(
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

const Winner = models.Winner || model('Winner', WinnerSchema)

export default Winner