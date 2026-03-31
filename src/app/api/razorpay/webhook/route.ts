import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { RazorpayWebhookEvent } from "@/types/razorpay";
import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Razorpay sends webhook for subscription  lifecycle events
export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
        return NextResponse.json({ error: true, message: 'Missing Signature' }, { status: 400 })
    }

    //verify webhook signature 
    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(body).digest('hex')

    if (signature !== expectedSignature) {
        console.error('Webhook,Signature mismatch')
        return NextResponse.json({ error: true, message: 'Invalid Signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Webhook, Event Received:', event.event)

    try {
        await connectDB()
        await handleWebhookEvent(event)
    } catch (err) {
        console.error('Webhook', err)
        return NextResponse.json({ error: true, message: 'Something went wrong' }, { status: 500 })
    }
    return NextResponse.json({ received: true })
}

async function handleWebhookEvent(event: RazorpayWebhookEvent) {
    const subscription = event.payload?.subscription?.entity
    if (!subscription) return

    const subscriptionId = subscription.id
    // const userId = subscription.notes?.userId as string | undefined

    switch (event.event) {
        //Subscription Activated ( first payment)
        case 'subscription.activated':
        case 'subscription.charged': {
            const endDate = subscription.current_end ? new Date(subscription.current_end * 1000) : getNextMonth()

            await User.findOneAndUpdate({ razorpaySubscriptionId: subscriptionId }, {
                subscriptionStatus: 'active',
                subscriptionEnd: endDate
            })
            console.log('Subscription Activated/charged', subscriptionId)
            break
        }
        //Subscription Cancelled by user or admin 
        case 'subscription.cancelled': {
            await User.findOneAndUpdate(
                { razorpaySubscriptionId: subscriptionId },
                { subscriptionStatus: 'cancelled' }
            )
            console.log('subscription cancelled', subscriptionId)
            break
        }

        //Subscription failed/halted grace period marked as lapsed 
        case 'subscription.halted': {
            await User.findOneAndUpdate(
                { razorpaySubscriptionId: subscriptionId },
                { subscriptionStatus: 'halted' }
            )
            console.log('Subscription Halted,Payment failed', subscriptionId)
            break
        }

        //Subscription Ended/Expired 
        case 'subscription.completed':
        case 'subscription.expired': {
            await User.findOneAndUpdate(
                { razorpaySubscriptionId: subscriptionId },
                { subscriptionStatus: 'inactive' }
            )
            console.log('Subscription Completed', subscriptionId)
        }
        default:
            console.log('Unhandled event', event.event)
    }
}

function getNextMonth(): Date {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d
}

