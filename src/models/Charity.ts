
import { model, models, Schema, Types, Document } from "mongoose";


export interface ICharityEvent {
    title: string
    date: Date
    location: string
    description?: string
}

export interface ICharity extends Document {
    _id: Types.ObjectId
    name: string
    slug: string          // URL-friendly, e.g. "cancer-research-uk"
    description: string
    shortDescription: string  // for cards (max 160 chars)
    images: string[]          // Cloudinary 
    coverImage: string        // primary image
    website?: string
    category: CharityCategory
    country: string
    featured: boolean         // shown on homepage spotlight
    events: ICharityEvent[]   // upcoming golf days etc.
    totalRaised: number       // running total from platform contributions (in paise)
    active: boolean           // soft delete
    createdAt: Date
    updatedAt: Date
}


const CharityEventSchema = new Schema<ICharityEvent>({
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
}, { _id: false })

export type CharityCategory =
    | 'health'
    | 'education'
    | 'environment'
    | 'poverty'
    | 'sports'
    | 'community'
    | 'other'

const CharitySchema = new Schema<ICharity>({
    name: {
        type: String, required: true, trim: true, maxlength: 100
    },
    slug: {
        type: String,
        match: [/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'],
    },
    description: {
        type: String, required: true, maxlength: 1000
    },
    shortDescription: { type: String, required: true, maxlength: 200 },
    images: [{ type: String }],
    coverImage: { type: String, default: '' },
    website: { type: String, trim: true },
    category: {
        type: String,
        enum: ['health', 'education', 'environment', 'poverty', 'sports', 'community', 'other'],
        default: 'other'
    },
    country: { type: String, default: 'India', trim: true },
    featured: { type: Boolean, default: false },
    events: [CharityEventSchema],
    totalRaised: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true })

CharitySchema.path('images').validate((value: string[]) => {
    return value.length <= 5
}, 'Maximum 5 images allowed')

//Creating Indexing for better search
CharitySchema.index({ slug: 1 })
CharitySchema.index({ featured: 1, active: 1 })
CharitySchema.index({ category: 1, active: 1 })

const Charity = models.Charity<ICharity> || model<ICharity>('Charity', CharitySchema)
export default Charity