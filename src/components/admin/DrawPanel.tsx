'use client'
import { publishDrawAction, simulateDrawAction } from '@/actions/draw'
import { DrawMode } from '@/models/Draw'
import { DrawResultClient, WinnerClient } from '@/types/draw'
import { useState, useTransition } from 'react'
import toast from 'react-hot-toast'
import { Button, LoadingSwap } from '../ui/Button'
import DrawNumberDisplay from '../DrawNumberDisplay'
import ShowWinners from '../ShowWinners'
import { MONTH_NAMES } from '@/utils/constants'

const MATCH_LABELS: Record<string, string> = {
    five: '5 number match',
    four: '4 number match',
    three: '3 number match'
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    simulated: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800'
}

export default function DrawPanel({ initialDraw, initialWinners }: {
    initialDraw: DrawResultClient | null, initialWinners: WinnerClient[]
}) {
    const [draw, setDraw] = useState<DrawResultClient | null>(initialDraw)
    const [winners, setWinners] = useState<WinnerClient[]>(initialWinners)
    const [mode, setMode] = useState<'random' | 'weighted'>('random')
    const [isPending, startTransition] = useTransition()

    const isPublished = draw?.status === 'published'
    const isSimulated = draw?.status === 'simulated'


    //Simulate draw - 
    const handleSimulate = () => {
        startTransition(async () => {
            const res = await simulateDrawAction(mode)
            if (res?.error) {
                toast.error(res.message || 'Simulation failed')
                return
            }
            setDraw(res.data?.draw ?? null)
            setWinners(res.data?.winners ?? [])
            toast.success(`Draw simulated using ${mode} algorithm,${res.message}`) // Show which mode was used for simulation
        })
    }

    //Publish draw -
    const handlePublish = () => {
        if (!confirm('Are you sure you want to publish this draw? This action cannot be undone.')) return
        startTransition(async () => {
            const res = await publishDrawAction()
            if (res?.error) {
                toast.error(res.message || 'Publish failed')
                return
            }
            setDraw(res.data?.draw ?? null)
            setWinners(res.data?.winners ?? [])
            toast.success('Draw published successfully')
        })
    }
    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 px-6 py-4 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        <div className={`absolute inset-0 rounded-full blur-md opacity-20 ${draw?.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className={`relative rounded-full px-3 py-0.5 font-bold tracking-tight uppercase text-[10px] border ${STATUS_STYLES[draw?.status ?? 'pending']}`}>
                            {draw?.status ?? 'pending'}
                        </span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-200">
                            {draw ? `${MONTH_NAMES[draw.month]} ${draw.year} Draw` : `${MONTH_NAMES[new Date().getMonth() + 1]} ${new Date().getFullYear()} Draw`}
                        </span>
                        {draw?.subscriberCountAtDraw && (
                            <span className="text-[11px] text-zinc-500">
                                {draw.subscriberCountAtDraw.toLocaleString()} subscribers active
                            </span>
                        )}
                    </div>
                </div>

                {draw?.jackpotCarriedOver && (
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                        <span className="text-amber-500 text-xs font-bold uppercase tracking-tighter">Rollover</span>
                        <span className="text-amber-200 font-mono font-bold">{draw.fiveFormatted}</span>
                    </div>
                )}
            </div>

            {/* Configuration Controls */}
            {!isPublished && (
                <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
                            Draw Configuration
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(['random', 'weighted'] as DrawMode[]).map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMode(m)}
                                disabled={isPending}
                                className={`group flex flex-col p-4 rounded-xl border-2 transition-all text-left ${mode === m
                                    ? 'border-blue-500/50 bg-blue-500/5 ring-4 ring-blue-500/10'
                                    : 'border-zinc-800 bg-zinc-800/30 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className={`font-bold capitalize ${mode === m ? 'text-blue-400' : 'text-slate-400'}`}>{m}</span>
                                    {mode === m && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                                </div>
                                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                                    {m === 'random' ? 'Standard lottery logic — absolute equal probability for every entry.' : 'Weighted by performance — historical score frequency affects draw weight.'}
                                </p>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button type="button" variant="primary" onClick={handleSimulate} disabled={isPending && !isSimulated} className="flex-1 h-12 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/10">
                            <LoadingSwap isLoading={isPending}>
                                {isSimulated ? '🔄 Re-Simulate Draw' : '⚡ Run Simulation'}
                            </LoadingSwap>
                        </Button>

                        {isSimulated && (
                            <Button type="button" variant="secondary" disabled={isPending} onClick={handlePublish} className="flex-1 h-12 rounded-xl text-sm font-bold bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                                <LoadingSwap isLoading={isPending}>
                                    {isPending ? 'Publishing...' : '🚀 Publish Draw'}
                                </LoadingSwap>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Drawn Numbers Display */}
            {draw && draw.drawnNumbers.length == 5 && (
                <DrawNumberDisplay draw={draw} role='admin' />
            )}

            {/* Winners List */}
            {winners.length > 0 && (
                <ShowWinners winners={winners} isPublished={isPublished} />
            )}
        </div>
    );
}
