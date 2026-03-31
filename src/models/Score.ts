import { Document, models, Models, Schema, Types, model } from "mongoose";


const ScoreSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    value: {
        type: Number, required: [true, 'Score is Required'],
        min: [1, 'Score must be at least 1'],
        max: [45, 'Score cannot exceed 45']
    },
    datePlayed: {
        type: Date, required: [true, 'Date Played is required'],
        validate: {
            validator: (v: Date) => v <= new Date(),
            message: 'Date Played cannot be in future'
        }
    },
}, { timestamps: true })

const Score = models.Score || model('Score', ScoreSchema)

export default Score
