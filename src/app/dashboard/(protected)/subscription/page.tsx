import { redirect } from 'next/navigation'
import { getSessionUser } from '@/actions/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Link from 'next/link'
import SubscriptionManager from './SubscriptionManager'
import CheckoutClient from '@/components/dashboard/CheckoutClient'
import {
    CreditCard,
    Calendar,
    CheckCircle2,
    AlertCircle,
    RefreshCcw,
    ShieldCheck
} from 'lucide-react'

async function getSubscriptionDetails(userId: string) {
    await connectDB()
    const user = await User.findById(userId)
        .select('subscriptionStatus subscriptionEnd razorpaySubscriptionId subscriptionPlan')
        .lean()
    return user
}

export default async function SubscriptionPage() {
    const session = await getSessionUser()
    if (!session) redirect('/login')

    const user = await getSubscriptionDetails(session.userId)
    if (!user) redirect('/login')

    const isActive = user.subscriptionStatus === 'active'

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header */}
                <header className="border-b border-zinc-800 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                            <CreditCard className="w-5 h-5 text-zinc-100" />
                        </div>
                        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Subscription</h1>
                    </div>
                    <p className="text-sm text-zinc-500 font-medium">
                        Manage your billing cycle, payment methods, and plan tier.
                    </p>
                </header>

                {/* ── Status Overview Card ──────────────────────────────────────── */}
                <div className="grid gap-6">
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl relative">
                        {/* Decorative background glow for active users */}
                        {isActive && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />
                        )}

                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic">Current Plan</span>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold text-zinc-100">
                                                {(user as any).subscriptionPlan === 'monthly' ? 'Monthly Pro' : 'Yearly Pro'}
                                            </h2>
                                            {isActive && (
                                                <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">
                                                    <CheckCircle2 className="w-3 h-3" /> Active
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-600" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">End Date</span>
                                                <span className="text-sm text-zinc-300">
                                                    {user.subscriptionEnd
                                                        ? new Date(user.subscriptionEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : 'No end date'
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-zinc-600" />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Security</span>
                                                <span className="text-sm text-zinc-300">Encrypted Billing</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription Actions (Cancel/Resume etc) */}
                                <div className="pt-4 sm:pt-0">
                                    <SubscriptionManager
                                        status={user.subscriptionStatus}
                                        subscriptionEnd={user.subscriptionEnd?.toISOString()}
                                        subscriptionId={user.razorpaySubscriptionId}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subscription ID Footer */}
                        {user.razorpaySubscriptionId && (
                            <div className="px-6 py-3 bg-zinc-950/50 border-t border-zinc-800 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Razorpay ID: {user.razorpaySubscriptionId}</span>
                                <RefreshCcw className="w-3 h-3 text-zinc-700 hover:text-zinc-500 cursor-pointer transition-colors" />
                            </div>
                        )}
                    </section>

                    {/* ── Checkout / Inactive State ─────────────────────────────────── */}
                    {user.subscriptionStatus === 'inactive' && (
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center space-y-6">
                            <div className="inline-flex p-3 bg-amber-500/10 rounded-full border border-amber-500/20 mb-2">
                                <AlertCircle className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-zinc-100">Subscription Inactive</h3>
                                <p className="text-sm text-zinc-500 max-w-sm mx-auto font-medium">
                                    Your premium features are currently locked. Renew your subscription to regain access to your dashboard and charity perks.
                                </p>
                            </div>

                            <div className="flex justify-center pt-4">
                                <CheckoutClient userName={session.name} userEmail={session.email} />
                            </div>

                            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
                                Secure payments powered by Razorpay
                            </p>
                        </section>
                    )}
                </div>

                {/* FAQ / Support Footer */}
                <footer className="pt-8 flex flex-col items-center gap-4 text-center">
                    <p className="text-xs text-zinc-600 max-w-md">
                        Have questions about your billing? Contact our support team for assistance with refunds or plan changes.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/terms" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors">Terms of Service</Link>
                        <Link href="/billing-faq" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors">Billing FAQ</Link>
                    </div>
                </footer>
            </div>
        </div>
    )
}