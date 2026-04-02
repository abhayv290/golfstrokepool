import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { RazorpayWebhookEvent } from "@/types/razorpay";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Razorpay sends webhook for subscription  lifecycle events

export async function GET() {
    return NextResponse.json({ message: 'Hello there' })
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        console.error('Webhook: Missing signature or secret configuration');
        return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 400 });
    }

    const expectedSignature = createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

    //timingSafeEqual to prevent timing attacks
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
        console.error('Webhook: Signature mismatch');
        return NextResponse.json({ error: true, message: 'Invalid Signature' }, { status: 400 });
    }
    const event = JSON.parse(body);

    try {
        await connectDB();
        await handleWebhookEvent(event);

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (err) {
        console.error('Webhook Processing Error:', err);
        // Returning 500 tells Razorpay to try again later
        return NextResponse.json({ error: true }, { status: 500 });
    }
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

