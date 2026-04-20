import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContributionLog extends Document {
    _id: mongoose.Types.ObjectId
    month: number
    year: number
    totalContributedPaise: number
    subscriberCount: number
    charityCount: number
    triggeredBy: mongoose.Types.ObjectId  // admin userId
    createdAt: Date
}

const ContributionLogSchema = new Schema<IContributionLog>(
    {
        month: { type: Number, required: true },
        year: { type: Number, required: true },
        totalContributedPaise: { type: Number, default: 0 },
        subscriberCount: { type: Number, default: 0 },
        charityCount: { type: Number, default: 0 },
        triggeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
)

// One log per month/year — prevents duplicate runs at DB level too
ContributionLogSchema.index({ month: 1, year: 1 }, { unique: true })

const ContributionLog: Model<IContributionLog> =
    (mongoose.models.ContributionLog as Model<IContributionLog>) ??
    mongoose.model<IContributionLog>('ContributionLog', ContributionLogSchema)

export default ContributionLog