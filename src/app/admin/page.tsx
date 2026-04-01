import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Draw from '@/models/Draw'
import Winner from '@/models/Winner'
import { formatINR } from '@/lib/drawEngine'
import Link from 'next/link'
import { Users, CreditCard, Award, Banknote, ArrowRight, Activity } from 'lucide-react'
import { cookies } from 'next/headers'

async function getStats() {
    await connectDB()
    const [totalUsers, activeSubscribers, pendingWinners, latestDraw] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ subscriptionStatus: 'active' }),
        Winner.countDocuments({ status: 'pending' }),
        Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 }).lean(),
    ])
    return { totalUsers, activeSubscribers, pendingWinners, latestDraw }
}

export default async function AdminOverviewPage() {
    const { totalUsers, activeSubscribers, pendingWinners, latestDraw } = await getStats()

    const stats = [
        { label: "Total Users", value: totalUsers, icon: Users },
        { label: "Active Subs", value: activeSubscribers, icon: CreditCard },
        { label: "Pending Review", value: pendingWinners, icon: Award },
        { label: "Last Prize Pool", value: latestDraw ? formatINR(latestDraw.prizePool?.total ?? 0) : '—', icon: Banknote }
    ]

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-12 bg-zinc-50/50 dark:bg-transparent min-h-screen">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Admin Overview
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Platform metrics and draw synchronization.
                    </p>
                </div>
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                    <Activity className="h-4 w-4 text-zinc-400" />
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                {stat.label}
                            </span>
                            <stat.icon className="h-4 w-4 text-zinc-300 group-hover:text-zinc-900 dark:text-zinc-600 dark:group-hover:text-zinc-100 transition-colors" />
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-semibold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-50">
                                {stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Verification Alert Section */}
            {pendingWinners > 0 && (
                <section className="group relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
                    {/* Subtle decorative gradient background */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-zinc-50 dark:bg-zinc-900/50 opacity-50 blur-3xl transition-opacity group-hover:opacity-100" />

                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xl dark:border-zinc-800 dark:bg-zinc-900">
                                🛡️
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-50">
                                    Action Required: Verification
                                </h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md leading-relaxed">
                                    There are <span className="font-semibold text-zinc-900 dark:text-zinc-200">{pendingWinners} winners</span> waiting for their scorecards to be approved.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/admin/winners"
                            className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-zinc-900 px-6 text-sm font-medium text-zinc-50 shadow transition-colors hover:bg-zinc-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                        >
                            View Winners List
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            )}
        </div>
    )
}