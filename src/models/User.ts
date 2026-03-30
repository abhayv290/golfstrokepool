import { SubscriptionStatus, UserRole } from "@/types/auth";
import { Document, model, models, Schema, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId,
    name: string
    email: string
    passwordHash: string
    role: UserRole
    subscriptionStatus: SubscriptionStatus
    razorpayCustomerId?: string
    razorpaySubscriptionId?: string
    subscriptionEnd?: Date
    selectedCharityId: Types.ObjectId
    charityContributionPercent: number //min 10
    createdAt: Date
    updatedAt: Date
}


const UserSchema = new Schema<IUser>({
    name: {
        type: String, trim: true,
        required: [true, 'Name is required'],
        minlength: [2, 'Must be at least two chars'],
        maxlength: [50, 'Must be at least two chars'],
    },
    email: {
        type: String, trim: true, lowercase: true, unique: true,
        required: [true, 'Email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['subscriber', 'admin'], default: 'subscriber' },
    subscriptionStatus: {
        type: String, default: 'inactive',
        enum: ['active', 'inactive', 'cancelled', 'lapsed'],
    },
    razorpayCustomerId: String,
    razorpaySubscriptionId: String,
    subscriptionEnd: Date,
    selectedCharityId: {
        type: Schema.Types.ObjectId,
        ref: 'Charity',
    },
    charityContributionPercent: {
        type: Number,
        default: 10,
        min: [10, 'Minimum contribution is 10%'],
        max: [100, 'Minimum contribution is 100%']
    }
}, { timestamps: true })

const User = models.User<IUser> || model<IUser>('User', UserSchema)
export default User
