export type PlanType = 'monthly' | 'yearly'


export interface SubscriptionResult {
    subscriptionId: string
    keyId: string
    amount: number
    currency: string
    name: string
    email: string
}

export interface RazorpayWebhookEvent {
    event: string
    payload: {
        subscription?: {
            entity: {
                id: string
                status: string
                current_end?: number
                notes?: Record<string, string>
            }
        }
        payment?: {
            entity: {
                id: string
                amount: number
            }
        }
    }
}

export interface RazorpayOptions {
    key: string
    subscription_id: string
    name: string
    description: string
    currency: string
    prefill: { name: string; email: string }
    theme: { color: string }
    modal: { ondismiss: () => void }
    handler: (response: {
        razorpay_payment_id: string
        razorpay_subscription_id: string
        razorpay_signature: string
    }) => void
}