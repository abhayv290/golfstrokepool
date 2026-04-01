import { WinnerClient } from '@/types/draw'

export default function ShowWinners({ winners, isPublished }: { winners: WinnerClient[], isPublished: boolean }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 className="text-sm font-bold text-slate-300">
                    {isPublished ? '🏆 FINAL WINNERS' : '🧪 SIMULATION PREVIEW'}
                </h2>
                <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">
                    COUNT: {winners.length}
                </span>
            </div>

            <div className="space-y-3">
                {winners.map((w, i) => (
                    <div key={w._id || i} className="flex items-center justify-between rounded-xl bg-zinc-950/40 border border-zinc-800/50 p-4 hover:border-zinc-700 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${w.matchType === 'five' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                w.matchType === 'four' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                                }`}>
                                {w.matchType === 'five' ? '5/5' : w.matchType === 'four' ? '4/5' : '3/5'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{w.userName}</p>
                                <p className="text-[11px] font-medium text-zinc-500">{w.userEmail}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-mono font-bold text-emerald-400">{w.prizeFormatted}</p>
                            <div className="flex gap-1 justify-end mt-1">
                                {w.matchedNumbers.map(num => (
                                    <span key={num} className="text-[9px] px-1 bg-zinc-800 text-zinc-400 rounded-sm border border-zinc-700">{num}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
