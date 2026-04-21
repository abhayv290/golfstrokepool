import { Document, model, Model, models, Schema, Types } from "mongoose";


export interface IOTP extends Document {
    _id: Types.ObjectId
    email: string
    otp: string
    expiresAt: Date
    verified: boolean;
    createdAt: Date
}

const OTPSchema = new Schema<IOTP>(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

// Auto-delete expired OTPs — MongoDB TTL index
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// One active OTP per email at a time
OTPSchema.index({ email: 1 })

const OTP: Model<IOTP> =
    (models.OTP as Model<IOTP>) ?? model<IOTP>('OTP', OTPSchema)

export default OTP
