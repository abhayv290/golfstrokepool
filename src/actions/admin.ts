'use server'

import { connectDB } from "@/lib/db"
import { getAuthUser } from "@/lib/session"
import Charity, { CharityCategory } from "@/models/Charity"
import Score from "@/models/Score"
import User from "@/models/User"
import Winner from "@/models/Winner"
import { CharityListItem, UserDetails, UserListItem, WinnerAdminItem } from "@/types/admin"
import { ActionResult } from "@/types/auth"
import { revalidatePath } from "next/cache"



//Guard

async function requireAdmin() {
    const auth = await getAuthUser()
    if (!auth || auth.role !== 'admin') {
        throw new Error('Admin Access Required')
    }
    return auth
}


//User ManageMent 

export async function getUsersAction(opts?: {
    search?: string
    status?: string
}): Promise<ActionResult<UserListItem[]>> {
    try {
        await requireAdmin()
        await connectDB()

        const query: Record<string, any> = {}
        if (opts?.search) {
            query.$or = [
                { name: { $regex: opts.search, $options: 'i' } },
                { email: { $regex: opts.search, $options: 'i' } },
            ]
        }
        if (opts?.status) {
            query.subscriptionStatus = opts.status
        }

        const users = await User.find(query).sort({ createdAt: -1 }).lean()

        return {
            error: false,
            message: 'User Fetched',
            data: users.map(u => ({
                _id: u._id.toString(),
                name: u.name,
                email: u.email,
                role: u.role,
                subscriptionStatus: u.subscriptionStatus,
                createdAt: u.createdAt.toISOString()
            }))
        }
    } catch (err) {
        console.error('UsersAction', err)
        return { error: true, message: 'Error Fetching User List' }
    }
}


export async function getUserDetailsAction(userId: string): Promise<ActionResult<UserDetails>> {
    try {
        await requireAdmin()
        await connectDB()
        const [user, scores] = await Promise.all([
            User.findById(userId).lean(),
            Score.find({ userId }).sort({ datePlayed: -1 }).lean()
        ])

        if (!user) return { error: true, message: 'User Not Found' }

        return {
            error: false, message: 'User Details Fetched',
            data: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                subscriptionStatus: user.subscriptionStatus,
                createdAt: user.createdAt.toISOString(),
                razorpayCustomerId: user.razorpayCustomerId,
                razorpaySubscriptionId: user.razorpaySubscriptionId,
                subscriptionEnd: user.subscriptionEnd?.toISOString(),
                charityContributionPercent: user.charityContributionPercent,
                scores: scores.map((s) => ({
                    _id: s._id.toString(),
                    value: s.value,
                    datePlayed: s.datePlayed.toISOString(),
                })),
            },
        }
    } catch (err) {
        console.error('getUserDetailsAction', err)
        return { error: true, message: 'Error Fetching User Details' }
    }
}



export async function updateUserAction(formdata: FormData): Promise<ActionResult> {
    try {
        await requireAdmin()
        await connectDB()
        const userId = formdata.get('userId') as string
        const role = formdata.get('role') as string
        const name = formdata.get('name') as string
        const subscriptionStatus = formdata.get('subscriptionStatus') as string

        if (!userId) return { error: true, message: 'User ID is required' }

        await User.findByIdAndUpdate(userId, {
            ...(name && { name }), ...(role && { role }), ...(subscriptionStatus && { subscriptionStatus })
        }, { returnDocument: 'after' })

        revalidatePath('/admin/users')
        revalidatePath('/admin/users/' + userId)
        return { error: false, message: 'User Updated Successfully' }
    } catch (err) {
        console.error('updateUserAction', err)
        return { error: true, message: 'Error Updating User' }
    }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
    if (!userId) return { error: true, message: 'User ID is required' }
    try {
        await requireAdmin()
        await connectDB()
        await Promise.all([
            User.findByIdAndDelete(userId),
            Score.deleteMany({ userId })
        ])
        revalidatePath('/admin/users')
        return { error: false, message: 'User Deleted Successfully' }
    } catch (err) {
        console.error('deleteUserAction', err)
        return { error: true, message: 'Error Deleting User' }
    }
}


//Winner Management 
export async function getWinnerAction(opts?: {
    status?: string
}): Promise<ActionResult<WinnerAdminItem[]>> {
    try {
        await requireAdmin()
        await connectDB()

        //form query 
        const query: Record<string, any> = {}
        if (opts?.status) query.status = opts.status

        const winners = await Winner.find(query).populate('userId', 'name email').populate('drawId', 'month year').sort({ createdAt: -1 }).lean()
        return {
            error: false,
            message: 'Winners Fetched',
            data: winners.map((w) => {
                const user = w.userId as any
                const draw = w.drawId as any
                return {
                    _id: w._id.toString(),
                    userId: user?._id?.toString() ?? '',
                    userName: user?.name ?? 'Unknown',
                    userEmail: user?.email ?? '',
                    drawId: draw?._id?.toString() ?? '',
                    drawMonth: draw?.month ?? 0,
                    drawYear: draw?.year ?? 0,
                    matchType: w.matchType,
                    matchedNumbers: w.matchedNumbers,
                    prizeAmount: w.prizeAmount,
                    status: w.status,
                    proofUrl: w.proofUrl,
                    adminNote: w.adminNote,
                    createdAt: w.createdAt.toISOString(),
                }
            }),
        }
    } catch (err) {
        console.error('getWinnerAction', err)
        return { error: true, message: 'Error Fetching Winners' }
    }
}


export async function reviewWinnerActions(formdata: FormData): Promise<ActionResult> {
    try {
        const admin = await requireAdmin()
        await connectDB()

        const winnerId = formdata.get('winnerId') as string
        const decision = formdata.get('decision') as 'approved' | 'rejected'
        const adminNote = (formdata.get('adminNote') as string)?.trim()

        if (!winnerId || !decision) return { error: true, message: 'Missing required Fields' }

        if (!['approved', 'rejected'].includes(decision)) return { error: true, message: 'Invalid Decision' }

        await Winner.findByIdAndUpdate(winnerId, {
            status: decision,
            adminNote: adminNote || undefined,
            reviewedBy: admin.userId,
            reviewedAt: new Date(),
        })

        revalidatePath('/admin/draws')
        return { error: false, message: 'Winner Reviewed Successfully' }

    } catch (err) {
        console.error('reviewWinnerActions', err)
        return { error: true, message: 'Error Reviewing Winner' }
    }
}

export async function markPaidAction(winnerId: string): Promise<ActionResult> {
    try {
        await requireAdmin()
        await connectDB()
        if (!winnerId) return { error: true, message: 'Winner ID is required' }

        const winner = await Winner.findById(winnerId)
        if (!winner) return { error: true, message: 'Winner Not Found' }
        if (winner.status !== 'approved') return { error: true, message: 'Only Approved Winners can be marked as Paid' }

        await Winner.findByIdAndUpdate(winnerId, {
            status: 'paid',
            paidAt: new Date(),
        })

        revalidatePath('/admin/draws')
        return { error: false, message: 'Winner Marked as Paid' }


    } catch (err) {
        console.error('markPaidAction', err)
        return { error: true, message: 'Error Marking Winner as Paid' }
    }
}


//Charity Management
export async function getCharitiesAdminAction(): Promise<ActionResult<CharityListItem[]>> {
    try {
        await requireAdmin()
        await connectDB()

        const charities = await Charity.find().sort({ createdAt: -1 }).lean()

        return {
            error: false,
            message: 'Charities Fetched',
            data: charities.map(c => ({
                _id: c._id.toString(),
                name: c.name,
                slug: c.slug,
                category: c.category,
                country: c.country,
                featured: c.featured,
                active: c.active,
                totalRaised: c.totalRaised,
            }))
        }
    } catch (err) {
        console.error('getCharitiesAdminAction', err)
        return { error: true, message: 'Error Fetching Charities' }
    }
}


export async function createCharityAction(formdata: FormData): Promise<ActionResult<{ slug: string }>> {
    try {
        await requireAdmin()
        await connectDB()

        const name = (formdata.get('name') as string)?.trim()
        const slug = (formdata.get('slug') as string)?.trim()
        const category = (formdata.get('category') as CharityCategory)
        const country = (formdata.get('country') as string)?.trim()
        const featured = formdata.get('featured') === 'on'
        const description = (formdata.get('description') as string)?.trim()
        const shortDescription = (formdata.get('shortDescription') as string)?.trim()
        const website = (formdata.get('website') as string)?.trim()

        if (!name || !slug || !description || !shortDescription) {
            return { error: true, message: 'Missing required fields' }
        }

        const existing = await Charity.findOne({ slug })
        if (existing) return { error: true, message: 'Slug already exists. Please choose a different one.' }

        await Charity.create({
            name, slug, category, country, featured, description, shortDescription, website
        })
        revalidatePath('/admin/charities')
        revalidatePath('/charities')
        return { error: false, message: 'Charity Created Successfully', data: { slug } }
    } catch (err) {
        console.error('createCharityAction', err)
        return { error: true, message: 'Error Creating Charity' }
    }
}


export async function updateCharityAction(formdata: FormData): Promise<ActionResult> {
    try {
        const charityId = formdata.get('charityId') as string
        if (!charityId) return { error: true, message: 'Charity ID is required' }

        await requireAdmin()
        await connectDB()

        const name = (formdata.get('name') as string)?.trim()
        const category = (formdata.get('category') as string)?.trim()
        const country = (formdata.get('country') as string)?.trim()
        const featured = formdata.get('featured') === 'on'
        const description = (formdata.get('description') as string)?.trim()
        const shortDescription = (formdata.get('shortDescription') as string)?.trim()
        const website = (formdata.get('website') as string)?.trim()
        const active = Boolean(formdata.get('active') === 'true' as string)
        await Charity.findByIdAndUpdate(charityId, {
            name, category, country, featured, description, shortDescription, website, active
        })

        revalidatePath('/admin/charities')
        revalidatePath('/charities')
        return { error: false, message: 'Charity Updated Successfully' }
    } catch (err) {
        console.error('updateCharityAction', err)
        return { error: true, message: 'Error Updating Charity' }
    }
}

export async function deleteCharityAction(charityId: string): Promise<ActionResult> {
    if (!charityId) return { error: true, message: 'Charity ID is required' }
    try {
        await requireAdmin()
        await connectDB()
        //Soft Delete - Preserve Data for users who selected this charity in the past 
        await Charity.findByIdAndUpdate(charityId, { active: false })

        revalidatePath('/admin/charities')
        revalidatePath('/charities')
        return { error: false, message: 'Charity Deleted Successfully' }

    } catch (err) {
        console.error('deleteCharityAction', err)
        return { error: true, message: 'Error Deleting Charity' }
    }
}

export async function toggleFeatureAction(charityId: string, featured: boolean): Promise<ActionResult> {
    if (!charityId) return { error: true, message: 'Charity ID is required' }
    try {
        await requireAdmin()
        await connectDB()

        //Only One feature at a time
        if (featured) await Charity.updateMany({ featured: true }, { $set: { featured: false } })

        await Charity.findByIdAndUpdate(charityId, { featured })

        revalidatePath('/admin/charities')
        revalidatePath('/charities')
        return { error: false, message: `Charity ${featured ? 'Featured' : 'Unfeatured'} Successfully` }
    } catch (err) {
        console.error('toggleFeatureAction', err)
        return { error: true, message: 'Error Toggling Feature Status' }
    }
}