import { redirect } from 'next/navigation'
import { getSessionUser } from '@/actions/auth'
import { getCharitiesAction, getUserCharitySelectionAction } from '@/actions/charity'
import CharitySelector from './CharitySelection'
import { Heart, ShieldCheck, Info } from 'lucide-react'

export const metadata = {
    title: 'Charity Allocation - Dashboard - GolfStrokePool',
    description: 'Manage your charity allocation on GolfStrokePool. Choose which organization receives a portion of your monthly subscription. A minimum of 10% is always contributed to support impactful causes through golf.',
    keywords: ['charity allocation', 'dashboard', 'golfstrokepool', 'subscription impact', 'nonprofit support', 'social good', 'golf charity']
}

export default async function DashboardCharityPage() {
    const user = await getSessionUser()
    if (!user) redirect('/login')

    // Safety check: only active subscribers can manage their charity allocation
    if (user.subscriptionStatus !== 'active') redirect('/dashboard/subscribe')

    const [charitiesResult, selectionResult] = await Promise.all([
        getCharitiesAction(),
        getUserCharitySelectionAction(),
    ])

    const charities = charitiesResult.data ?? []
    const selection = selectionResult.data ?? { charity: null, contributionPercent: 10 }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
                    <Heart className="h-7 w-7 text-rose-500" />
                    Your Charity Impact
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    Personalize your subscription impact. Choose which organization receives a portion
                    of your monthly payment. A minimum of <span className="font-bold text-zinc-900 dark:text-zinc-200">10%</span> is always contributed.
                </p>
            </header>

            {/* Current Allocation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600">
                        <Heart className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Current Selection</p>
                        <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50 truncate">
                            {selection.charity?.name ?? "No charity selected"}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">Contribution</p>
                        <p className="mt-1 font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                            {selection.contributionPercent}% <span className="text-xs font-medium text-zinc-500">of subscription</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Selector Component Wrapper */}
            <section className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-[2rem] p-1 border border-zinc-100 dark:border-zinc-800">
                    <div className="bg-white dark:bg-zinc-950 rounded-[1.8rem] border border-zinc-200 dark:border-zinc-800 p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-8 text-zinc-400 dark:text-zinc-500">
                            <Info className="h-4 w-4" />
                            <h2 className="text-xs font-bold uppercase tracking-widest">Update Your Preferences</h2>
                        </div>

                        <CharitySelector
                            charities={charities}
                            currentCharityId={selection.charity?._id.toString() ?? null}
                            currentPercent={selection.contributionPercent}
                        />
                    </div>
                </div>
            </section>

            {/* Platform Note */}
            <footer className="text-center pt-4">
                <p className="text-xs text-zinc-400 dark:text-zinc-600 max-w-md mx-auto italic">
                    Changes made to your charity selection will take effect from your next billing cycle.
                    All contributions are processed securely via Razorpay.
                </p>
            </footer>
        </div>
    )
}