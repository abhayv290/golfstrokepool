import { model, models, Schema } from "mongoose";


export type DrawStatus = 'pending' | 'simulated' | 'published'
export type DrawMode = 'random' | 'weighted'
export type MatchType = 'five' | 'four' | 'three'

const PrizePoolSchema = new Schema(
    {
        total: { type: Number, default: 0 },
        five: { type: Number, default: 0 },
        four: { type: Number, default: 0 },
        three: { type: Number, default: 0 },
    },
    { _id: false }
)

const DrawSchema = new Schema(
    {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        drawnNumbers: {
            type: [Number],
            default: [],
            validate: {
                validator: (v: number[]) =>
                    v.length === 0 || (v.length === 5 && v.every((n) => n >= 1 && n <= 45)),
                message: 'drawnNumbers must be exactly 5 numbers between 1 and 45',
            },
        },
        mode: {
            type: String,
            enum: ['random', 'weighted'],
            default: 'random',
        },
        status: {
            type: String,
            enum: ['pending', 'simulated', 'published'],
            default: 'pending',
        },
        prizePool: { type: PrizePoolSchema, default: () => ({}) },
        jackpotCarriedOver: { type: Number, default: 0 },
        jackpotRolledToNext: { type: Boolean, default: false },
        subscriberCountAtDraw: { type: Number, default: 0 },
        publishedAt: Date,
    },
    { timestamps: true }
)

DrawSchema.index({ year: 1, month: 1 }, { unique: true })
DrawSchema.index({ status: 1 })

const Draw = models.Draw || model('Draw', DrawSchema)
export default Draw