'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cancelSubscriptionAction } from '@/actions/cancelSubscription'
import toast from 'react-hot-toast'
import { AlertTriangle, RefreshCw, ArrowRight, Ban, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
    status: string
    subscriptionEnd?: string
    subscriptionId?: string
}

export default function SubscriptionManager({ status, subscriptionEnd, subscriptionId }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const endDate = subscriptionEnd
        ? new Date(subscriptionEnd).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
        })
        : null

    const canReactivate =
        status === 'cancelled' &&
        subscriptionEnd &&
        new Date() < new Date(subscriptionEnd)

    const handleCancel = () => {
        if (!confirm(
            `Are you sure you want to cancel?\n\nYou will keep access until ${endDate ?? 'end of billing period'}. You can reactivate before then.`
        )) return
        startTransition(async () => {
            const res = await cancelSubscriptionAction()
            if (res.error) {
                toast.error(res.message)
                return
            }
            toast.success('Subscription cancelled')
            router.refresh()
        })
    }

    return (
        <div className="w-full">
            {/* Active subscription */}
            {status === 'active' && (
                <div className="space-y-4">
                    <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50">
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Cancelling will stop future renewals. You keep full access
                            until the end of your current billing period.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isPending}
                        className="group flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-xs font-bold text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 rounded-lg transition-all disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                        Cancel Subscription
                    </button>
                </div>
            )}

            {/* Cancelled but still within billing period */}
            {status === 'cancelled' && canReactivate && (
                <div className="space-y-4">
                    <div className="bg-amber-500/5 rounded-lg p-4 border border-amber-500/10">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Subscription is <span className="text-zinc-200 font-medium">cancelled</span>.
                                Access ends on <span className="text-zinc-200 font-medium">{endDate}</span>.
                                Subscribe Again to after this period end , to maintain uninterpreted service.
                                <br />
                                <span>Subscribing Again with below button will start new subscriptionPlan, So older not resume </span>
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/subscribe"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-white/5"
                    >
                        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 font-bold" />}
                        Subscription Again
                    </Link>
                </div>
            )}

            {/* Cancelled and billing period ended */}
            {status === 'cancelled' && !canReactivate && (
                <div className="text-center sm:text-left space-y-3">
                    <p className="text-sm text-zinc-500 font-medium">Your subscription has ended.</p>
                    <Link
                        href="/dashboard/subscribe"
                        className="inline-flex items-center gap-2 text-xs font-bold bg-zinc-100 text-zinc-950 py-2 px-6 rounded-lg hover:bg-white transition-colors"
                    >
                        Subscribe Again <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            )}

            {/* Lapsed — payment failed */}
            {status === 'lapsed' && (
                <div className="space-y-4">
                    <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/10">
                        <p className="text-xs text-zinc-400 leading-relaxed">
                            <span className="text-red-400 font-bold uppercase tracking-wider block mb-1">Payment Failed</span>
                            Razorpay will retry automatically. If the issue persists, update your payment method or subscribe again.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/subscribe"
                        className="inline-flex items-center gap-2 text-xs font-bold border border-zinc-800 text-zinc-100 py-2 px-6 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        Renew Subscription
                    </Link>
                </div>
            )}

            {/* Inactive — never subscribed */}
            {status === 'inactive' && (
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-zinc-500 font-medium font-mono text-center sm:text-left">STATUS: NULL_SUBSCRIPTION</p>
                    <Link
                        href="/dashboard/subscribe"
                        className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-emerald-500 text-emerald-950 py-2.5 px-6 rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Get Started
                    </Link>
                </div>
            )}
        </div>
    )
}