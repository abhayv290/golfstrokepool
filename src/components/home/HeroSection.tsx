'use client'
import { formatINR } from '@/lib/drawEngine'
import Link from 'next/link'
import { ArrowRight, Trophy, Users, Heart } from 'lucide-react'

import { PrizeBreakdown } from '@/types/draw'

export default function HeroSection({ prizePool, subscriberCount }: {
    prizePool: PrizeBreakdown,
    subscriberCount: number,
}) {
    const handleScrollToHowItWorks = () => {
        const el = document.getElementById('how-it-works')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    return (
        <section className="relative overflow-hidden bg-white dark:bg-zinc-950 pt-16 pb-24 lg:pt-32 lg:pb-40">
            {/* Background decorative element */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-100/50 via-transparent to-transparent dark:from-zinc-900/20 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center space-y-8">

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 leading-[0.9]">
                        Play golf.<br />
                        <span className="text-zinc-400 dark:text-zinc-600 italic">Win prizes.</span><br />
                        Change lives.
                    </h1>

                    {/* Subtext */}
                    <p className="max-w-2xl text-lg md:text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                        Subscribe, log your Stableford scores, and enter monthly prize draws —
                        while a portion of every subscription goes to a charity you believe in.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <Link
                            href="/dashboard/scores"
                            className="h-14 px-8 rounded-full bg-zinc-700 text-zinc-50 dark:bg-zinc-200 dark:text-zinc-900 hover:bg-zinc-900 dark:hover:bg-zinc-100 font-bold text-lg flex items-center justify-center gap-2  transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
                        >
                            Start playing <ArrowRight className="h-5 w-5" />
                        </Link>
                        <button
                            onClick={handleScrollToHowItWorks}
                            className="h-14 px-8 py-auto rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center"
                        >
                            How it works
                        </button>
                    </div>

                    {/* Live Stats Grid */}
                    <div className="pt-16 w-full max-w-4xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none">

                            {/* Stat 1 */}
                            <div className="bg-white dark:bg-zinc-950 p-8 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Users className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Community</span>
                                </div>
                                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                    {subscriberCount.toLocaleString()}+
                                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Active players</span>
                            </div>

                            {/* Stat 2 */}
                            {prizePool && (
                                <div className="bg-white dark:bg-zinc-950 p-8 flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                        <Trophy className="h-4 w-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Recent Win</span>
                                    </div>
                                    <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                        {formatINR(prizePool?.total ?? 0)}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Last prize pool</span>
                                </div>
                            )}

                            {/* Stat 3 */}
                            <div className="bg-white dark:bg-zinc-950 p-8 flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Impact</span>
                                </div>
                                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                    10%<span className="text-zinc-400 dark:text-zinc-600">+</span>
                                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Goes to charity</span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}