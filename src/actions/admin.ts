'use server'

import { deleteFromCloud, uploadToCloudinary } from "@/lib/cloudinary"
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


export async function createCharityAction(formdata: FormData): Promise<ActionResult<{ slug: string, _id: string }>> {
    try {
        await requireAdmin()
        await connectDB()

        const name = (formdata.get('name') as string)?.trim()
        const slug = (formdata.get('slug') as string)?.trim()
        const category = (formdata.get('category') as CharityCategory)
        const country = (formdata.get('country') as string)?.trim()
        const featured = (formdata.get('featured') as 'true' | 'false') === 'true'
        const description = (formdata.get('description') as string)?.trim()
        const shortDescription = (formdata.get('shortDescription') as string)?.trim()
        const website = (formdata.get('website') as string)?.trim()
        const active = (formdata.get('active') as 'true' | 'false') === 'true'
        if (!name || !slug || !description || !shortDescription) {
            return { error: true, message: 'Missing required fields' }
        }

        const existing = await Charity.findOne({ slug })
        if (existing) return { error: true, message: 'Slug already exists. Please choose a different one.' }

        const { _id } = await Charity.create({
            name, slug, category, country, featured, description, shortDescription, website, active
        })
        revalidatePath('/admin/charities')
        revalidatePath('/charities')
        return { error: false, message: 'Charity Created Successfully', data: { slug, _id: _id.toString() } }
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
        const featured = (formdata.get('featured') as 'true' | 'false') === 'true'
        const description = (formdata.get('description') as string)?.trim()
        const shortDescription = (formdata.get('shortDescription') as string)?.trim()
        const website = (formdata.get('website') as string)?.trim()
        const active = (formdata.get('active') as 'true' | 'false') === 'true'
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

export async function uploadCharityMediaAction(formdata: FormData): Promise<ActionResult> {
    const charityId = formdata.get('charityId') as string;
    if (!charityId) return { error: true, message: 'id is required' };

    const coverImage = formdata.get('coverImage') as File | null;
    const images = formdata.getAll('images') as File[];

    const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE = 1 * 1024 * 1024; // Actual 1MB

    // Validation 
    if (coverImage && (!allowedTypes.includes(coverImage.type) || coverImage.size > MAX_SIZE)) {
        return { error: true, message: 'Cover image invalid type or exceeds 1MB' };
    }

    const validImages = images.filter(img => img.size > 0);
    if (validImages.some(i => !allowedTypes.includes(i.type) || i.size > MAX_SIZE)) {
        return { error: true, message: 'Gallery images invalid type or exceed 1MB' };
    }

    try {
        await connectDB();

        //check the size of the your gallery 
        const charity = await Charity.findById(charityId).select('images coverImage').lean()
        if (charity && (validImages.length > (5 - charity.images.length))) {
            return { error: true, message: 'you can only upload max 5 gallery images' }
        }
        // Upload Cover Image
        let coverUrl = null;
        if (coverImage) {
            const buffer = Buffer.from(await coverImage.arrayBuffer());
            coverUrl = await uploadToCloudinary(buffer, {
                folder: 'charityCover',
                filename: `cover_${Date.now()}`,
            });

            //Clear the older one if exists
            if (charity && charity.coverImage) {
                const oldFileName = (charity.coverImage as string).split('/').pop()
                if (oldFileName) {
                    const filename = oldFileName.split('.')[0]
                    console.log(oldFileName, filename)
                    await deleteFromCloud('charityCover/' + filename)
                }
            }
        }
        //  Upload Gallery Images
        let imagesUrl: string[] = [];
        if (validImages.length > 0) {
            imagesUrl = await Promise.all(validImages.map(async (file) => {
                const buffer = Buffer.from(await file.arrayBuffer());
                return uploadToCloudinary(buffer, {
                    folder: 'charityImage',
                    filename: `img_${Math.random().toString(20).substring(5)}_${Date.now()}`,
                });
            }));
        }

        // Update the DB
        const updatePayload: Record<string, any> = {
            $push: { images: { $each: imagesUrl } },
        };
        if (coverUrl !== null) {
            updatePayload.coverImage = coverUrl;
        }
        await Charity.findByIdAndUpdate(charityId, updatePayload);
        revalidatePath('/admin/charities')
        revalidatePath('/charities')
        return { error: false, message: 'Media Uploaded successfully' };

    } catch (err) {
        console.error('UploadCharityMedia Error:', err);
        return { error: true, message: 'Error processing upload' };
    }
}

export async function deleteCharityGalleryImage(charityId: string, fileUrl: string): Promise<ActionResult> {
    if (!charityId || !fileUrl) return { error: true, message: 'ID and File URL are required' };

    const filename = fileUrl.split('/').pop()?.split('.')[0];
    if (!filename) {
        return { error: true, message: 'Invalid file URL format' };
    }

    try {
        await connectDB();

        //  Atomic Update: Pull the image and return the document in one go
        const updatedCharity = await Charity.findByIdAndUpdate(
            charityId,
            { $pull: { images: fileUrl } },
            { returnDocument: 'before' } // Returns the document BEFORE the pull so we can verify the image was there
        ).select('images');

        if (!updatedCharity) {
            return { error: true, message: 'Charity not found' };
        }

        // Check if the image was actually in the array before the update
        const wasImagePresent = (updatedCharity.images as string[]).includes(fileUrl);
        if (!wasImagePresent) {
            return { error: true, message: 'Image not found in this charity gallery' };
        }
        const publicId = `charityImage/${filename}`;
        await deleteFromCloud(publicId);

        revalidatePath('/admin/charities')
        revalidatePath('/charities')
        return { error: false, message: 'Image successfully deleted' };
    } catch (err) {
        console.error('DeleteMediaFile Error:', err);
        return { error: true, message: 'Server error while deleting image' };
    }
}

export async function deleteCharityAction(charityId: string): Promise<ActionResult> {
    if (!charityId) return { error: true, message: 'Charity ID is required' }
    try {
        await requireAdmin()
        await connectDB()
        //Soft Delete - 
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