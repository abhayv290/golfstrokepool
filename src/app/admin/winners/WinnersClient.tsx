'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { reviewWinnerActions, markPaidAction } from '@/actions/admin'
import { formatINR } from '@/lib/drawEngine'
import { WinnerAdminItem } from '@/types/admin'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, ExternalLink, CheckCircle2, XCircle, Clock, Banknote, Filter, Activity } from 'lucide-react'
import { MONTH_NAMES as M } from '@/utils/constants'


const MONTH_NAMES = M.map(m => m.length > 3 ? m.slice(0, 3) : m)

interface ReviewFormFields {
    adminNote: string
}

function WinnerRow({ winner, onUpdate }: { winner: WinnerAdminItem; onUpdate: () => void }) {
    const [expanded, setExpanded] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { register, handleSubmit, reset } = useForm<ReviewFormFields>()

    const onReview = (decision: 'approved' | 'rejected') => (data: ReviewFormFields) => {
        const formData = new FormData()
        formData.set('winnerId', winner._id)
        formData.set('decision', decision)
        formData.set('adminNote', data.adminNote)
        startTransition(async () => {
            const res = await reviewWinnerActions(formData)
            if (res?.error) {
                toast.error(res.message || 'Review action failed')
                return
            }
            toast.success(res.message || `Winner ${decision}`)
            reset()
            onUpdate()
        })
    }

    const onMarkPaid = () => {
        startTransition(async () => {
            const res = await markPaidAction(winner._id)
            if (res?.error) {
                toast.error(res.message || 'Mark as paid failed')
                return
            }
            toast.success(res.message || 'Winner marked as paid')
            onUpdate()
        })
    }

    const statusStyles: Record<string, string> = {
        pending: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
        proof_submitted: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20",
        approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        rejected: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
        paid: "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
    }

    return (
        <>
            <tr className={`group transition-colors ${expanded ? 'bg-zinc-50/50 dark:bg-zinc-900/40' : 'hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20'}`}>
                <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{winner.userName}</span>
                        <span className="text-xs text-zinc-500 tabular-nums">{winner.userEmail}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {MONTH_NAMES[winner.drawMonth]} {winner.drawYear}
                </td>
                <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                        <Activity className="h-3 w-3" /> {winner.matchType}-Match
                    </span>
                </td>
                <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                    {formatINR(winner.prizeAmount)}
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[winner.status] || statusStyles.pending}`}>
                        {winner.status.replace('_', ' ')}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                            ${expanded
                                ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                                : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-900 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:border-zinc-50 dark:text-zinc-400'
                            }`}
                    >
                        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        Review
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr>
                    <td colSpan={6} className="px-6 pb-6 pt-2 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 animate-in slide-in-from-top-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Side: Details */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Proof of Winning</label>
                                        <div className="mt-2">
                                            {winner.proofUrl ? (
                                                <a
                                                    href={winner.proofUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-700"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    View scorecard proof
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                                                    <Clock className="h-4 w-4" /> No proof uploaded yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Match Details</label>
                                        <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Numbers: {winner.matchedNumbers.map(n => (
                                                <span key={n} className="inline-block bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded mr-1 tabular-nums">{n}</span>
                                            ))}
                                        </p>
                                    </div>
                                    {winner.adminNote && (
                                        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">Latest Admin Note</p>
                                            <p className="text-sm italic text-zinc-600 dark:text-zinc-400 mt-1">&apos; {winner.adminNote} &apos;</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Actions */}
                                <div className="space-y-4 border-l border-zinc-100 dark:border-zinc-800 md:pl-8">
                                    {!['approved', 'paid'].includes(winner.status) ? (
                                        <form className="space-y-4" noValidate>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Verification Verdict</label>
                                                <textarea
                                                    {...register('adminNote')}
                                                    placeholder="Add a reason for approval/rejection..."
                                                    rows={2}
                                                    className="w-full rounded-lg border border-zinc-200 bg-transparent p-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:border-zinc-800"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    disabled={isPending || !winner.proofUrl}
                                                    onClick={handleSubmit(onReview('approved'))}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                                >
                                                    <CheckCircle2 className="h-4 w-4" /> Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isPending}
                                                    onClick={handleSubmit(onReview('rejected'))}
                                                    className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20 transition-colors"
                                                >
                                                    <XCircle className="h-4 w-4" /> Reject
                                                </button>
                                            </div>
                                        </form>
                                    ) : winner.status === 'approved' ? (
                                        <div className="h-full flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                                            <p className="text-sm text-zinc-500 mb-4">Payment disbursement pending</p>
                                            <button
                                                type="button"
                                                onClick={onMarkPaid}
                                                disabled={isPending}
                                                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-zinc-900 text-zinc-50 text-sm font-bold hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 transition-all"
                                            >
                                                <Banknote className="h-4 w-4" />
                                                Confirm Payment Sent
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-emerald-600 font-bold gap-2">
                                            <CheckCircle2 className="h-5 w-5" /> Fully Processed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}

export default function WinnersClient({ initialWinners }: { initialWinners: WinnerAdminItem[] }) {
    const [winners, setWinners] = useState(initialWinners)
    const [statusFilter, setStatusFilter] = useState('')

    const filtered = statusFilter ? winners.filter((w) => w.status === statusFilter) : winners
    const onUpdate = () => window.location.reload()

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Winners Review</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Total across all periods: <span className="font-bold text-zinc-900 dark:text-zinc-200">{winners.length}</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 w-full md:w-48 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-300 appearance-none cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="proof_submitted">Proof Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="paid">Paid</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Winner</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Draw Period</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Match</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Prize</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Status</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50 text-right">Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filtered.map((w) => (
                                <WinnerRow key={w._id} winner={w} onUpdate={onUpdate} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 mb-4">
                            <Activity className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No results</h3>
                        <p className="text-xs text-zinc-500 mt-1">Try changing the filter or wait for new submissions.</p>
                    </div>
                )}
            </div>
        </div>
    )
}