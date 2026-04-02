import { formatINR } from '@/lib/drawEngine'
import { WinnerClient, WinnerStatus } from '@/types/draw'
import { Trophy, Clock, CheckCircle2, XCircle, ArrowUpRight, } from 'lucide-react'
import Link from 'next/link'

interface Winnings extends Omit<WinnerClient, 'userName' | 'userEmail'> {
    drawDate: string
}

export default function WinningHistory({ winnings }: { winnings: Winnings[] }) {
    const totalWon = winnings.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.prizeAmount, 0)

    const statusConfig: Record<WinnerStatus, { label: string; icon: typeof Clock; class: string }> = {
        pending: {
            label: 'Action Required',
            icon: Clock,
            class: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
        },
        proof_submitted: {
            label: 'In Review',
            icon: Clock,
            class: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
        },
        approved: {
            label: 'Approved',
            icon: CheckCircle2,
            class: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
        },
        paid: {
            label: 'Disbursed',
            icon: CheckCircle2,
            class: 'text-zinc-900 bg-zinc-100 border-zinc-200 dark:bg-zinc-50 dark:text-zinc-950 dark:border-zinc-300'
        },
        rejected: {
            label: 'Rejected',
            icon: XCircle,
            class: 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
        },
    }

    return (
        <div className="space-y-6">
            {/* Lifetime Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Lifetime Earnings</p>
                        <h3 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 tabular-nums">
                            {formatINR(totalWon)}
                        </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-zinc-900 dark:bg-zinc-200 flex items-center justify-center text-zinc-200 dark:text-zinc-800">
                        <Trophy className="h-6 w-6" />
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Total Wins</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                        {winnings.length} <span className="text-sm font-medium text-zinc-500 tracking-normal ml-1">Draws</span>
                    </p>
                </div>
            </div>

            {/* History Table */}
            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-500">Draw Period</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-500">Match Type</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-500">Amount</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-500">Status</th>
                                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-zinc-500 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {winnings.length > 0 ? (
                                winnings.map((w) => {
                                    const config = statusConfig[w.status] || statusConfig.pending
                                    const StatusIcon = config.icon

                                    return (
                                        <tr key={w._id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100 tabular-nums uppercase tracking-tight">
                                                {new Date(w.drawDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-medium text-zinc-500">Match-{w.matchType}</span>
                                            </td>
                                            <td className="px-6 py-4 font-black tabular-nums text-zinc-900 dark:text-zinc-50">
                                                {formatINR(w.prizeAmount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${config.class}`}>
                                                    <StatusIcon className="h-3 w-3" />
                                                    {config.label}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {w.status === 'pending' ? (
                                                    <Link href={`/dashboard/winners/${w._id}/?status=verify`} className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-50 underline underline-offset-4 hover:opacity-70 transition-opacity">
                                                        Verify Now
                                                    </Link>
                                                ) : (
                                                    <Link href={`/dashboard/winners/${w._id}`} className='font-bold  dark:text-zinc-50 dark:hover:bg-zinc-200  rounded-xl'>
                                                        <ArrowUpRight className="size-5 ml-auto transition-transform hover:scale-125" />
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">
                                        No winning history found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}