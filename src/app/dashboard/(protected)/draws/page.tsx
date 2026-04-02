import { getSessionUser } from "@/actions/auth"
import { getCurrentDrawAction, getPastDrawsAction } from "@/actions/draw"
import DrawNumberDisplay from "@/components/DrawNumberDisplay"
import ShowWinners from "@/components/ShowWinners"
import { redirect } from "next/navigation"
import { MONTH_NAMES } from "@/utils/constants"


export const metadata = {
    title: 'Draws - Dashboard - GolfStrokePool',
    description: 'View the results of the monthly draws on GolfStrokePool. Check out the winning numbers and see who won based on their Stableford scores. Stay updated on the latest draw outcomes and your chances to win.',
    keywords: ['monthly draws', 'winning numbers', 'draw results', 'Stableford scores', 'golf prizes', 'dashboard']
}

export default async function DrawPage() {
    const user = await getSessionUser()
    if (!user) redirect('/login')
    if (user.subscriptionStatus !== 'active') redirect('/dashboard/subscribe')

    const [currentRes, pastRes] = await Promise.all([
        getCurrentDrawAction(),
        getPastDrawsAction()
    ])

    const currentDraw = currentRes.data?.draw ?? null
    const currentWinners = currentRes.data?.winners ?? []
    const pastDraws = pastRes.data ?? []

    const now = new Date()
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            {/* Header Section */}
            <header className="relative pb-6 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Monthly Draws
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
                    Draws are conducted on the <span className="font-medium text-slate-900 dark:text-slate-200">1st of every month</span>.
                    Winners are selected based on Stableford scores from the previous month—the more you play, the better your odds.
                </p>
            </header>

            {/* Current Month Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        {MONTH_NAMES[now.getMonth() + 1]} {now.getFullYear()}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                        Current Period
                    </span>
                </div>

                {!currentDraw || currentDraw.status === 'pending' ? (
                    <div className="group relative rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 py-12 px-6 text-center transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
                            <span className="text-xl text-slate-400">⏳</span>
                        </div>
                        <p className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Draws not yet run</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Results usually appear within the first few days of the month.
                        </p>
                    </div>
                ) : currentDraw.status === 'simulated' ? (
                    <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-900/10">
                        <div className="flex items-start gap-3">
                            <span className="text-lg">⚡</span>
                            <div>
                                <p className="font-semibold text-amber-900 dark:text-amber-200">Finalizing Results</p>
                                <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-300/80">
                                    The admin is currently verifying the draw. Check back in a few minutes!
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <DrawNumberDisplay draw={currentDraw} />
                        <ShowWinners winners={currentWinners} isPublished={true} />

                    </div>
                )}
            </section>

            {/* Past Draws Section */}
            {pastDraws.length > 1 && (
                <section className="space-y-4 pt-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        Past History
                    </h2>
                    <div className="grid gap-3">
                        {pastDraws.slice(1).map((d) => (
                            <div
                                key={d._id}
                                className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {MONTH_NAMES[d.month]} {d.year}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Numbers</span>
                                        <div className="flex gap-1">
                                            {d.drawnNumbers.map((num, i) => (
                                                <span key={i} className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                        {d.totalFormatted}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tight">
                                        Prize Pool
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
