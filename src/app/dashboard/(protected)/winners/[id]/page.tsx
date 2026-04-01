
import { notFound } from 'next/navigation'
import { Trophy, Wallet } from 'lucide-react'
import { getWinnerDetails } from '@/actions/winners'
import WinnerProofForm from '../ProofForm'

interface Props {
    params: Promise<{ id: string }>
}
export default async function WinnerDetailsPage({ params }: Props) {
    const { id } = await params
    const { error, data: winner } = await getWinnerDetails(id)
    if (error || !winner) notFound()

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-8 rounded-4xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Winning Draw</p>
                        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase leading-none">{new Date(winner.drawDate).toLocaleDateString('en-IN', {
                            month: 'short',
                            year: 'numeric'
                        })}</h1>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-zinc-50 dark:text-zinc-900 shadow-xl">
                        <Trophy className="h-7 w-7" />
                    </div>
                </div>
                <div className="p-8 rounded-4xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40 flex  justify-between items-center  ">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Prize Amount</p>
                        <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{winner.prizeFormatted}</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-zinc-50 dark:text-zinc-900 shadow-xl">
                        <Wallet className="h-7 w-7" />
                    </div>
                </div>
            </div>

            <WinnerProofForm winner={winner} />
        </div>
    )
}