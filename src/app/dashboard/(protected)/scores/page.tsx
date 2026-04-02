import { redirect } from 'next/navigation'
import { getSessionUser } from '@/actions/auth'
import { getScoreAction } from '@/actions/scores'
import ScoreManager from '@/components/dashboard/ScoreManager'


export const metadata = {
  title: 'My Scores - Dashboard - GolfStrokePool',
  description: 'View and manage your Stableford scores on GolfStrokePool. Keep track of your last 5 scores, add new ones, and see how you are performing over time. Your golf game has never been more rewarding.',
  keywords: ['golf scores', 'Stableford tracking', 'score management', 'golf performance', 'dashboard']
}

export default async function ScoresPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  if (user.subscriptionStatus !== 'active') redirect('/dashboard/subscribe')

  const scores = (await getScoreAction()).data

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My scores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your last 5 Stableford scores. Adding a new score automatically removes the oldest.
        </p>
      </div>
      {scores && <ScoreManager initialScores={scores} />}
    </div>
  )
}