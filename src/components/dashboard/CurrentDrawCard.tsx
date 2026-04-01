// components/dashboard/home/CurrentDrawCard.tsx
import { ScoreEntry } from '@/actions/scores'
import { formatINR } from '@/lib/drawEngine'
import { DrawResultClient, WinnerClient } from '@/types/draw'
import { Trophy, Activity, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export default function CurrentDrawCard({ draw, userScores, winnings }: {
    draw: DrawResultClient | null
    userScores: ScoreEntry[]
    winnings: WinnerClient | null
}) {
    const isWinner = winnings && winnings.status === 'pending'
    const isPublished = draw?.status === 'published'

    return (
        <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isWinner
            ? 'border-zinc-600 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900/40 shadow-sm'
            : 'border-zinc-300 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm'
            }`}>

            {/* Background Icon Decor - Very subtle */}
            <Activity className="absolute -right-12 -top-12 h-80 w-80 text-zinc-100/50 dark:text-zinc-900/20 rotate-12 pointer-events-none" />

            <div className="relative z-10 p-8 space-y-8">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em]">
                            {isPublished ? 'Status: Published' : 'Status: Simulation'}
                        </span>
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest tabular-nums">
                            {MONTH_NAMES[draw?.month ?? 0]},{draw?.year}
                        </span>
                    </div>
                    {isWinner && (
                        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                            <Trophy className="h-5 w-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Winning Match</span>
                        </div>
                    )}
                </div>

                {/* Main Content Title */}
                <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 leading-[0.85] uppercase">
                        {isPublished ? 'Results\nReleased.' : 'Draw\nIn Progress.'}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-sm leading-relaxed font-medium">
                        {isPublished
                            ? "Compare your scores against the drawn numbers. Verified winners are eligible for the prize pool."
                            : "Your current Stableford scores are automatically entered as your draw numbers."}
                    </p>
                </div>

                {/* Draw Numbers - Strictly Zinc */}
                {isPublished && (
                    <div className="flex flex-wrap gap-3 pt-2">
                        {draw.drawnNumbers.map((num: number) => {
                            const isMatch = userScores.some((s: ScoreEntry) => Number(s.value) === num)
                            return (
                                <div key={num} className={`h-16 w-16 rounded-xl flex items-center justify-center text-2xl font-black tabular-nums border-2 transition-all ${isMatch
                                    ? 'bg-zinc-900 border-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 scale-105'
                                    : 'border-zinc-200 bg-transparent text-zinc-300 dark:border-zinc-800 dark:text-zinc-700'
                                    }`}>
                                    {num}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Winner Action - High Contrast Inversion */}
                {isWinner && (
                    <div className="mt-8 rounded-2xl bg-zinc-900 dark:bg-zinc-50 p-6 shadow-xl shadow-zinc-200 dark:shadow-none transition-transform hover:scale-[1.01]">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-800 dark:bg-zinc-200">
                                    <CheckCircle2 className="h-6 w-6 text-zinc-50 dark:text-zinc-950" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg text-zinc-50 dark:text-zinc-950 tracking-tight leading-none">
                                        Potential Win: {formatINR(winnings.prizeAmount)}
                                    </h4>
                                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
                                        Action Required: Payout Verification
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/dashboard/winners/verify"
                                className="group flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-black text-xs uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-sm"
                            >
                                Submit Proof
                                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}