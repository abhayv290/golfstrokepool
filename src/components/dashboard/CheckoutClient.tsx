'use client'

import { createSubscriptionAction, verifyPaymentAction } from "@/actions/createSubscription"
import { PlanType, RazorpayOptions } from "@/types/razorpay"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { useState } from "react"
import toast from "react-hot-toast"
import { Button, LoadingSwap } from "../ui/Button"
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react"

interface Props {
    userName: string
    userEmail: string
}

const PLANS = [
    {
        id: 'monthly' as PlanType,
        label: 'Monthly Access',
        price: '₹999',
        period: '/mo',
        description: 'Complete access to monthly draws. Cancel anytime.',
        badge: null,
    },
    {
        id: 'yearly' as PlanType,
        label: 'Annual Membership',
        price: '₹9,999',
        period: '/yr',
        description: 'Best value. Save 20% compared to monthly billing.',
        badge: 'Save ₹2,000',
    },
]

export default function CheckoutClient({ userName, userEmail }: Props) {
    const router = useRouter()
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly')
    const [status, setStatus] = useState<'idle' | 'loading' | 'verifying' | 'error'>('idle')

    const handleSubscribe = async () => {
        setStatus('loading')
        const res = await createSubscriptionAction(selectedPlan)

        if (res?.error || !res?.data) {
            setStatus('error')
            toast.error(res.message ?? 'Failed to initiate payment')
            return
        }

        const { subscriptionId, keyId, currency, name } = res.data

        const options: RazorpayOptions = {
            key: keyId,
            subscription_id: subscriptionId,
            name,
            description: 'Golf Portal Membership',
            currency,
            prefill: { name: userName, email: userEmail },
            theme: { color: '#09090b' }, // zinc-950
            modal: {
                ondismiss: () => setStatus('idle'),
            },
            handler: async (res) => {
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
                router.push('/dashboard')
                router.refresh()
            }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.on('payment.failed', () => {
            setStatus('error')
            toast.error('Payment failed. Please try again.')
        })
        rzp.open()
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Plan Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PLANS.map(plan => {
                    const isSelected = selectedPlan === plan.id
                    return (
                        <button
                            key={plan.id}
                            type='button'
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative text-left rounded-2xl border-2 p-6 transition-all duration-200 outline-none flex flex-col justify-between ${isSelected
                                ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/40 ring-1 ring-zinc-900 dark:ring-zinc-100 shadow-sm'
                                : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950'
                                }`}
                        >
                            {plan.badge && (
                                <span className="absolute -top-2.5 right-4 rounded-full bg-zinc-900 dark:bg-zinc-50 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-zinc-50 dark:text-zinc-950 shadow-sm">
                                    {plan.badge}
                                </span>
                            )}

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        {plan.label}
                                    </span>
                                    {isSelected ? (
                                        <CheckCircle2 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full border border-zinc-200" />
                                    )}
                                </div>

                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase tabular-nums">
                                        {plan.price}
                                    </span>
                                    <span className="text-sm font-bold text-zinc-400 lowercase">{plan.period}</span>
                                </div>
                            </div>

                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-4 leading-relaxed">
                                {plan.description}
                            </p>
                        </button>
                    )
                })}
            </div>

            {/* Bottom Section */}
            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-zinc-400 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Secure Payment via Razorpay</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Your subscription is encrypted and safe. Change your plan or cancel any time from your dashboard.</p>
                    </div>
                </div>

                <Button
                    onClick={handleSubscribe}
                    type="button"
                    variant="primary"
                    disabled={status === 'loading' || status === 'verifying'}
                    className="w-full h-14 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 dark:shadow-none"
                >
                    <LoadingSwap isLoading={status === 'loading'}>
                        {status === 'verifying' ? (
                            <span className="flex items-center gap-2">
                                <Zap className="h-4 w-4 animate-pulse" /> Finalizing...
                            </span>
                        ) : (
                            `Complete Purchase - ${(PLANS.find(p => p.id === selectedPlan))?.price}`
                        )}
                    </LoadingSwap>
                </Button>
            </div>
        </div>
    )
}