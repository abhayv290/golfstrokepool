import { connectDB } from '@/lib/db'
import Charity from '@/models/Charity'
import { formatINR } from '@/lib/drawEngine'
import ContributionTrigger from './Trigger'
import {
    Coins,
    BarChart3,
    Trophy,
    ArrowUpRight,
    Info,
    LayoutDashboard
} from 'lucide-react'

async function getCharityTotals() {
    await connectDB()
    return Charity.find({ active: true })
        .select('name totalRaised')
        .sort({ totalRaised: -1 })
        .lean()
}

export default async function AdminContributionsPage() {
    const charities = await getCharityTotals()
    const grandTotal = charities.reduce((sum, c) => sum + c.totalRaised, 0)

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                            <LayoutDashboard className="w-6 h-6 text-zinc-500" />
                            Charity Contributions
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1 font-medium">Monitor and trigger monthly donation distributions.</p>
                    </div>

                    {/* Grand Total Highlight Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 shadow-xl shadow-black/50">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Coins className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Grand Total Raised</span>
                            <span className="text-xl font-bold text-zinc-100">{formatINR(grandTotal)}</span>
                        </div>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-3">

                    {/* ── Table Section (Left 2 Columns) ────────────────────────────── */}
                    <section className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <BarChart3 className="w-4 h-4 text-zinc-500" />
                            <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">All-time totals</h2>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-950/50 border-b border-zinc-800">
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Charity</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Total raised</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {charities.map((c, index) => (
                                        <tr key={c._id.toString()} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {index === 0 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                                                    <span className="text-sm font-medium text-zinc-200">{c.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 font-mono text-sm text-zinc-300">
                                                    {formatINR(c.totalRaised)}
                                                    <ArrowUpRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── Control Panel (Right 1 Column) ───────────────────────────── */}
                    <aside className="space-y-6">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Info className="w-4 h-4 text-zinc-500" />
                                <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Operations</h2>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-sm">
                                <p className="text-xs text-zinc-500 leading-relaxed italic">
                                    Use the trigger below to process monthly contributions. This will calculate percentages based on active subscriptions and update charity balances.
                                </p>

                                <div className="pt-2">
                                    <ContributionTrigger />
                                </div>
                            </div>
                        </section>

                    </aside>
                </div>
            </div>
        </div>
    )
}