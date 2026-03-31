'use client'

import { createSubscriptionAction, verifyPaymentAction } from "@/actions/createSubscription"
import { PlanType, RazorpayOptions } from "@/types/razorpay"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { useState } from "react"
import toast from "react-hot-toast"
import { Button, LoadingSwap } from "../ui/Button"



interface Props {
    userName: string
    userEmail: string
}

const PLANS = [
    {
        id: 'monthly' as PlanType,
        label: 'Monthly',
        price: '₹999',
        period: '/month',
        description: 'Billed Every month,Cancel Every time',
        badge: null,
        highlight: false
    },
    {
        id: 'yearly' as PlanType,
        label: 'Yearly',
        price: '₹9,999',
        period: '/year',
        description: 'Billed Every year,Save 20% vs monthly',
        badge: null,
        highlight: true
    },
]

export default function CheckoutClient({ userName, userEmail }: Props) {
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly')
    const [status, setStatus] = useState<'idle' | 'loading' | 'verifying' | 'error'>('idle')

    const handleSubscribe = async () => {
        setStatus('loading')
        //Create Subscription on Server 
        const res = await createSubscriptionAction(selectedPlan)

        if (res?.error || !res?.data) {
            toast.error(res.message ?? 'Failed to Initiate Payment')
            return
        }
        const { subscriptionId, keyId, currency, name, } = res.data

        //Open Razorpay Modal 
        const options: RazorpayOptions = {
            key: keyId,
            subscription_id: subscriptionId,
            name,
            description: 'Golf-Portal Subscription Modal',
            currency,
            prefill: {
                name: userName,
                email: userEmail,
            },
            theme: {
                color: '#1818b' //zinc-900
            },
            modal: {
                ondismiss: () => {
                    setStatus('idle')
                }
            },
            handler: async (res) => {
                //verify payment signature on server
                setStatus('verifying')
                const verifyResult = await verifyPaymentAction({
                    razorpayPaymentId: res.razorpay_payment_id,
                    razorpaySubscriptionId: res.razorpay_subscription_id,
                    razorpaySignature: res.razorpay_signature
                })
                if (verifyResult?.error) {
                    setStatus('error')
                    toast.error(verifyResult?.message)
                    return
                }

                //Redirect to Dashboard 
                router.push('/dashboard')
                router.refresh()
            }

        }

        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', (res) => {
            setStatus('error')
            toast.error('Payment failed ,Please Try Again')
        })

        rzp.open()
        setStatus('idle')
    }

    return (
        <>
            {/* Razorpay checkout.js*/}
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />
            {/* Plan Cards  */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5  mb-8">
                {PLANS.map(plan => {
                    const isSelected = selectedPlan === plan.id
                    return (
                        <button key={plan.id} type='button'
                            onClick={() => setSelectedPlan(plan.id)}
                            className={['relative text-left rounded-2xl border-2 p-5  transition-all duration-150  outline-none', isSelected ? 'border-primary bg-primary/5  ring-2  ring-primary/20' : 'border-border  hover:border-primary/40'].join(' ')}>
                            {/* Best Value Badge  */}
                            {plan.badge && (
                                <span className="absolute top-4  right-4 rounded-full bg-primary px-2.5  py-0.5  text-xs font-medium  text-primary-foreground">
                                    {plan.badge}
                                </span>
                            )}
                            {/* Selector Indicator  */}
                            <div className={`w-4 h-4  rounded-full border-2 mb-4 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-muted-foreground/40'}`}>
                                {isSelected && (
                                    <div className="size-2  rounded-full bg-primary" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">{plan.label}</p>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-3xl font-semibold">{plan.price}</span>
                                <span className="text-sm text-muted-foreground">{plan.period}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </button>
                    )
                })}
            </div>

            <Button onClick={handleSubscribe} type="button" variant="primary" disabled={status === 'loading' || status === 'verifying'} className="w-full ">
                <LoadingSwap isLoading={status === 'loading'}>
                    {status === 'verifying' && 'Verifying Payment'}
                    {(status === 'idle' || status === 'error') && (
                        `Subscribe  - ${(PLANS.find(p => p.id === selectedPlan))?.price} ${(PLANS.find(p => p.id === selectedPlan))?.period}`
                    )}
                </LoadingSwap>
            </Button>

        </>
    )
}


// function formatPrice(price: number): string {
//     return new Intl.NumberFormat('en-IN', {
//         style: 'currency',
//         currency: 'INR',
//     }).format(price)

// }