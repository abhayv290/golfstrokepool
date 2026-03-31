import { model, models, Schema } from "mongoose";



const CharityEventSchema = new Schema({
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, trim: true }
}, { _id: false })


const CharitySchema = new Schema({
    name: {
        type: String, required: true, trim: true, maxlength: 100
    },
    match: [/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'],
    description: {
        type: String, required: true, maxlength: 1000
    },
    shortDesc: { type: String, required: true, maxlength: 200 },
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
    event: [CharityEventSchema],
    totalRaised: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true })

//Creating Indexing for better search
CharitySchema.index({ slug: 1 })
CharitySchema.index({ featured: 1, active: 1 })
CharitySchema.index({ category: 1, active: 1 })

const Charity = models.Charity || model('Charity', CharitySchema)
export default Charity