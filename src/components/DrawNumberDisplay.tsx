
import { DrawResultClient } from '@/types/draw'

export default function DrawNumberDisplay({ draw, role = 'subscriber' }: { draw: DrawResultClient, role?: 'subscriber' | 'admin' }) {
    return (
        <div className="rounded-2xl bg-linear-to-b from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Official Results</h2>
                    <p className="text-xl font-black text-white italic">MATCH FIVE</p>
                </div>
                {role === 'admin' && (
                    <span className="px-3 py-1 rounded-full bg-zinc-950 text-zinc-400 text-[10px] font-mono border border-zinc-800 uppercase tracking-tighter">
                        {draw.mode} Algorithm
                    </span>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-4 py-4">
                {draw.drawnNumbers.map((n) => (
                    <div key={n} className="group relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" />
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-700 text-2xl font-black text-blue-400 shadow-inner">
                            {n}
                        </div>
                    </div>
                ))}
            </div>

            {/* Prize Pool Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border border-zinc-800 rounded-xl overflow-hidden">
                {[
                    { label: 'Jackpot (5)', value: draw.fiveFormatted, rollover: draw.jackpotRolledToNext, color: 'text-amber-400' },
                    { label: '4-Match Pool', value: draw.fourFormatted, rollover: false, color: 'text-blue-400' },
                    { label: '3-Match Pool', value: draw.threeFormatted, rollover: false, color: 'text-slate-200' },
                ].map((tier, idx) => (
                    <div key={tier.label} className={`p-4 text-center bg-zinc-900/50 ${idx !== 2 ? 'border-b sm:border-b-0 sm:border-r border-zinc-800' : ''}`}>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">{tier.label}</p>
                        <p className={`text-lg font-mono font-bold ${tier.color}`}>{tier.value}</p>
                        {tier.rollover && (
                            <span className="inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded">Rollover →</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
