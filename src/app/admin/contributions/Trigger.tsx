'use client'

import { useState, useTransition } from 'react'
import { ContributionSummary, triggerMonthlyContributionsAction } from '@/actions/contributions'
import { formatINR } from '@/lib/drawEngine'
import {
    Play,
    Loader2,
    CheckCircle2,
    Users,
    UserPlus,
    UserMinus,
    IndianRupee,
    ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContributionTrigger() {
    const [isPending, startTransition] = useTransition()
    const [result, setResult] = useState<ContributionSummary | null>(null)

    const handleTrigger = () => {
        if (!confirm(
            'This will increment totalRaised for all charities based on current active subscribers.\n\nOnly run this once per month. Continue?'
        )) return
        setResult(null)


        startTransition(async () => {
            const res = await triggerMonthlyContributionsAction()
            if (res.error) {
                toast.error(res.message)
                return
            }
            setResult(res.data!)
        })
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-widest">Monthly Engine</h2>
                <p className="text-xs text-zinc-500 leading-relaxed">
                    Execute after the monthly draw is published. This calculates and commits all
                    active subscriber contributions to charity balances.
                </p>
            </div>

            <button
                type="button"
                onClick={handleTrigger}
                disabled={isPending}
                className="group relative flex items-center justify-center gap-2 w-full py-3 px-4 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 text-xs font-bold rounded-lg transition-all active:scale-[0.98] overflow-hidden"
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span className="relative z-10">
                    {isPending ? 'Processing Distributions...' : 'Trigger Monthly Contributions'}
                </span>
            </button>

            {/* Summary after trigger */}
            {result && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
                    <div className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Run Completed Successfully</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                        <StatBox
                            icon={<Users className="w-3.5 h-3.5" />}
                            label="Total Subs"
                            value={result.totalSubscribers}
                        />
                        <StatBox
                            icon={<IndianRupee className="w-3.5 h-3.5" />}
                            label="Total Value"
                            value={formatINR(result.totalContributedPaise)}
                            highlight
                        />
                        <StatBox
                            icon={<UserPlus className="w-3.5 h-3.5" />}
                            label="With Charity"
                            value={result.subscribersWithCharity}
                        />
                        <StatBox
                            icon={<UserMinus className="w-3.5 h-3.5" />}
                            label="No Charity"
                            value={result.subscribersWithoutCharity}
                        />
                    </div>

                    {/* Per charity breakdown */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Detailed Breakdown</h3>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800/50 overflow-hidden">
                            {result.charityBreakdown.map((c) => (
                                <div key={c.charityId} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-zinc-200">{c.charityName}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter italic">
                                            {c.contributorCount} Contributors
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono font-bold text-emerald-500">
                                            +{formatINR(c.contributionPaise)}
                                        </span>
                                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function StatBox({ icon, label, value, highlight = false }: {
    icon: React.ReactNode,
    label: string,
    value: string | number,
    highlight?: boolean
}) {
    return (
        <div className="bg-zinc-900 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-zinc-500">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
            </div>
            <p className={`text-lg font-bold leading-none ${highlight ? 'text-emerald-400' : 'text-zinc-100'}`}>
                {value}
            </p>
        </div>
    )
}