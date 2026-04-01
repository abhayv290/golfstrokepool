'use server'
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/session";
import Charity, { ICharity } from "@/models/Charity";
import User from "@/models/User";
import { ActionResult } from "@/types/auth";
import { CharityCard } from "@/types/charity";
import { revalidatePath } from "next/cache";



export async function getCharitiesAction(opts?: {
    category?: string
    search?: string
}): Promise<ActionResult<CharityCard[]>> {
    try {
        await connectDB()

        const query: Record<string, any> = { active: true }
        if (opts?.category) query.category = opts.category

        if (opts?.search) {
            query.$or = [
                { name: { $regex: opts.search, $options: 'i' } },
                { shortDescription: { $regex: opts.search, $options: 'i' } },
            ]
        }

        const charities = await Charity.find(query).sort({ featured: -1, name: -1 }).lean()

        return {
            error: false, message: 'Charities fetched successfully',
            data: charities.map(c => ({
                _id: c._id.toString(),
                name: c.name,
                slug: c.slug,
                shortDescription: c.shortDescription,
                coverImage: c.coverImage,
                category: c.category,
                country: c.country,
                featured: c.featured,
                totalRaised: c.totalRaised,
            }))
        }
    } catch (err) {
        console.error('CharityAction', err)
        return { error: true, message: 'Failed to fetch charities' }
    }
}


export async function getCharityBySlugAction(slug: string): Promise<ActionResult<ICharity>> {
    try {
        await connectDB()

        const charity = await Charity.findOne({ slug, active: true }).lean()
        if (!charity) return { error: true, message: 'Charity not found' }

        return {
            error: false, message: 'Charity fetched successfully', data: charity
        }
    } catch (err) {
        console.error('CharityBySlugAction', err)
        return { error: true, message: 'Failed to fetch charity' }
    }
}


// Auth select charity + set contribution % 

export async function selectCharityAction(formdata: FormData): Promise<ActionResult> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Unauthorized' }

    const charityId = formdata.get('charityId') as string
    const percentRaw = Number(formdata.get('contributionPercent'))

    if (!charityId) {
        return { error: true, message: 'Charity ID is required' }
    }

    if (isNaN(percentRaw) || percentRaw < 10 || percentRaw > 100) {
        return { error: true, message: 'contribution must be a  between 10% and 100%' }
    }

    try {
        await connectDB()

        const charity = await Charity.findById(charityId)
        if (!charity || !charity.active) {
            return { error: true, message: 'Charity Not Found' }
        }

        //update user with charity and contribution %
        await User.findByIdAndUpdate(auth.userId, {
            selectedCharityId: charity._id,
            charityContributionPercent: percentRaw,
        })
        revalidatePath('/dashboard/charity')
        return { error: false, message: 'Charity selected successfully' }

    } catch (err) {
        console.error('SelectCharityAction', err)
        return { error: true, message: 'Failed to select charity' }
    }
}


//GET User's current charity selection and contribution % 
export interface UserCharitySelection {
    charity: CharityCard | null
    contributionPercent: number
}

export async function getUserCharitySelectionAction(): Promise<ActionResult<UserCharitySelection>> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Unauthorized' }
    try {
        await connectDB()

        const user = await User.findById(auth.userId).populate('selectedCharityId').lean()
        if (!user) return { error: true, message: 'User not found' }

        const charity = user.selectedCharityId as ICharity | null

        return {
            error: false, message: 'fetched', data: {
                contributionPercent: user.charityContributionPercent,
                charity: charity ? ({ ...charity, _id: charity._id.toString() }) : null
            }
        }
    } catch (err) {
        console.error('GetUserCharitySelectionAction', err)
        return { error: true, message: 'Failed to fetch charity selection' }
    }
}

