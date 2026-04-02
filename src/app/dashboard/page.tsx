import { getSessionUser } from "@/actions/auth"
import { getCurrentDrawAction } from "@/actions/draw"
import { getScoreAction } from "@/actions/scores"
import { getUsersWinningsAction } from "@/actions/winners"
import CurrentDrawCard from "@/components/dashboard/CurrentDrawCard"
import { ScoreMiniSummary } from "@/components/dashboard/ScoreMiniSummary"
import SubscriptionCard from "@/components/dashboard/Stats"
import WinningHistory from "@/components/dashboard/WinningHitory"
import { redirect } from "next/navigation"

export const metadata = {
    title: 'Dashboard - GolfStrokePool',
    description: 'Your personalized dashboard on GolfStrokePool. Track your Stableford scores, view your draw history, and see how you stack up against the competition. Your golf game has never been more rewarding.',
    keywords: ['dashboard', 'golf scores', 'draw history', 'Stableford tracking', 'personalized stats', 'golf performance']
}


async function getDashboardData(userId: string) {
    const [currentDraws, score, winnings] = await Promise.all([
        getCurrentDrawAction(),
        getScoreAction(),
        getUsersWinningsAction()
    ])
    return {
        draw: currentDraws.data ? currentDraws.data.draw : null,
        winner: currentDraws.data?.winners.find(w => w.userId === userId) ?? null, scores: score.data ?? [],
        winnings: winnings.data ?? []
    }
}

export default async function DashboardPage() {
    const user = await getSessionUser()
    if (!user) redirect('/login')

    const { draw, winner, scores, winnings } = await getDashboardData(user.userId)

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Welcome back, {user.name.split(' ')[0]}
                </h1>
                <p className="text-sm text-zinc-500 mt-1">Here is what&apos;s happening with your season.</p>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Main Hook) */}
                <div className="lg:col-span-2 space-y-6">
                    <CurrentDrawCard
                        draw={draw}
                        userScores={scores}
                        winnings={winner}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ScoreMiniSummary scores={scores} />
                        {/* <CharityImpactCard selection={data.charitySelection} /> */}
                    </div>
                </div>

                {/* Right Column (Status & History) */}
                <div className="space-y-6">
                    <SubscriptionCard user={user} />
                    <WinningHistory winnings={winnings} />
                </div>
            </div>
        </div>
    )
}