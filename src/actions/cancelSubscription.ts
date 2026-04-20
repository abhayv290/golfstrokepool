'use server'

import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/db'
import { getAuthUser, setAuthCookies } from '@/lib/session'
import { signToken } from '@/lib/jwt'
import razorpay from '@/lib/razorpay'
import User from '@/models/User'
import type { ActionResult } from '@/types/auth'

export async function cancelSubscriptionAction(): Promise<ActionResult> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Not Authenticated' }

    try {
        await connectDB()

        const user = await User.findById(auth.userId)
        if (!user) return { error: true, message: 'User Not found' }

        // Guards
        if (user.subscriptionStatus !== 'active') {
            return { error: true, message: 'No Active Subscription' }
        }
        if (!user.razorpaySubscriptionId) {
            return { error: true, message: 'No Subscription Id Found' }
        }

        // Cancel on Razorpay — cancel_at_cycle_end: 1 means user keeps
        // access until the end of the current billing period, not immediately
        await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, true);

        // Update DB immediately — don't wait for webhook
        // Webhook will also fire and hit the same update, which is fine
        user.subscriptionStatus = 'cancelled'
        await user.save()

        // Re-issue JWT so middleware reflects cancelled status immediately
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            subscriptionStatus: 'cancelled',
            subscriptionEnd: user.subscriptionEnd
                ? Math.floor(user.subscriptionEnd.getTime() / 1000)
                : undefined,
        })
        await setAuthCookies(token)

        revalidatePath('/dashboard/profile')
        revalidatePath('/dashboard/subscription')
        return { error: false, message: 'Subscription Cancelled' }

    } catch (err: any) {
        console.error('[cancelSubscriptionAction]', err)
        return {
            error: true,
            message: err?.error?.description ?? err?.message ?? 'Failed to cancel subscription',
        }
    }
}

