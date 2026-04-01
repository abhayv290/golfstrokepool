'use server'

import { connectDB } from "@/lib/db"
import { signToken } from "@/lib/jwt"
import razorpay from "@/lib/razorpay"
import { getAuthUser, setAuthCookies } from "@/lib/session"
import User from "@/models/User"
import { ActionResult } from "@/types/auth"
import { PlanType, SubscriptionResult } from "@/types/razorpay"
import { createHmac } from 'node:crypto'


//Plan Ids 
const PLAN_IDS = {
    monthly: process.env.RAZORPAY_MONTHLY_PLAN_ID!,
    yearly: process.env.RAZORPAY_YEARLY_PLAN_ID!
}


//Create Razorpay subscription 
export async function createSubscriptionAction(
    plan: PlanType
): Promise<ActionResult<SubscriptionResult>> {
    const authUser = await getAuthUser()

    if (!authUser) return {
        error: true,
        message: 'Not Authenticated'
    }
    if (!PLAN_IDS[plan]) {
        return { error: true, message: `Plan ID for ${plan} not configured` }
    }

    try {
        await connectDB()

        const user = await User.findById(authUser.userId)
        if (!user) return {
            error: true, message: 'User not found'
        }

        let customerId = user.razorpayCustomerId

        if (!customerId) {
            const customer = await razorpay.customers.create({
                name: user.name,
                email: user.email,
                fail_existing: false
            })
            customerId = customer.id
            user.razorpayCustomerId = customerId
            await user.save()
        }

        //Create Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: PLAN_IDS[plan],
            customer_notify: true,
            quantity: 1,
            total_count: plan === 'yearly' ? 12 : 120,  //max billing cycle
            notes: {
                userId: authUser.userId,
                plan
            }
        })
        user.razorpaySubscriptionId = subscription.id
        user.subscriptionPlan = plan
        await user.save()

        return {
            error: false,
            message: 'Payment Initiated',
            data: {
                subscriptionId: subscription.id,
                keyId: process.env.RAZORPAY_KEY_ID!,
                amount: plan === 'monthly' ? Number(process.env.RAZORPAY_MONTHLY_AMOUNT ?? 99900) //₹999
                    : Number(process.env.RAZORPAY_YEARLY_AMOUNT ?? 999900), //₹9999
                currency: 'INR',
                name: 'Golf Portal',
                email: user.email,
            }
        }

    } catch (err) {
        console.error('CreateSubscriptionError', err)
        return {
            error: true, message: 'Something went wrong'
        }
    }

}

export async function verifyPaymentAction(payload: {
    razorpayPaymentId: string
    razorpaySubscriptionId: string
    razorpaySignature: string
}): Promise<ActionResult> {
    const authUser = await getAuthUser()
    if (!authUser) {
        return { error: true, message: 'Not Authenticated' }
    }
    const { razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = payload

    //Verify HMAC-signature
    const body = `${razorpayPaymentId}|${razorpaySubscriptionId}`
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex')

    if (expectedSignature !== razorpaySignature) {
        console.error('VerifySignature,Signature Mismatch')
        return {
            error: true,
            message: 'Payment Verification Failed'
        }
    }

    try {
        await connectDB()

        //fetch Subscription From razorpay 
        const subscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId)

        const subscriptionEnd = subscription.current_end ? new Date(subscription.current_end * 1000) : undefined

        const user = await User.findOneAndUpdate({
            _id: authUser.userId, razorpaySubscriptionId
        }, {
            subscriptionStatus: 'active',
            subscriptionEnd: subscriptionEnd
        }, { new: true })

        if (!user) {
            return { error: true, message: 'User or Subscription not found' }
        }

        //Re- Issue JWT with updated payload , so client see the subscription active
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            subscriptionStatus: user.subscriptionStatus
        })

        await setAuthCookies(token)
        return { error: false, message: 'Subscription Added' }
    } catch (err) {
        console.error('Verify Signature', err)
        return { error: true, message: 'Something went wrong,try again' }
    }
}
//helper function for subscription end date
// function getSubscriptionEndDate(plan: PlanType): Date {

//     const now = new Date()
//     const subscriptionEnd = new Date(now)
//     if (plan === 'monthly') {
//         subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)
//     } else {
//         subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1)
//     }
//     return subscriptionEnd
// }