import Link from 'next/link'
import { connectDB } from '@/lib/db'
import Charity from '@/models/Charity'
import Draw from '@/models/Draw'
import User from '@/models/User'
import HeroSection from '@/components/home/HeroSection'
import { PrizeTier, StepCard } from '@/components/home/Cards'
import { CharitySpotlight } from '@/components/home/CharitySpotLight'
import { MONTH_NAMES } from '@/utils/constants'
async function getHomepageData() {
  await connectDB()
  const [featuredCharity, latestDraw, subscriberCount] = await Promise.all([
    Charity.findOne({ featured: true, active: true }).lean(),
    Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 }).lean(),
    User.countDocuments({ subscriptionStatus: 'active' }),
  ])
  return { featuredCharity, latestDraw, subscriberCount }
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Subscribe',
    description: 'Choose a monthly or yearly plan. A portion of every subscription goes directly to your chosen charity.',
  },
  {
    step: '02',
    title: 'Enter your scores',
    description: 'Log your last 5 Stableford golf scores. These become your numbers in the monthly draw — no extra entry needed.',
  },
  {
    step: '03',
    title: 'Win and give',
    description: 'Every month 5 numbers are drawn. Match 3, 4, or all 5 of your scores to win your share of the prize pool.',
  },
]

export const PRIZE_TIERS = [
  { match: '5 numbers', pool: '40%', label: 'Jackpot', note: 'Rolls over if unclaimed' },
  { match: '4 numbers', pool: '35%', label: 'Second tier', note: 'Split equally among winners' },
  { match: '3 numbers', pool: '25%', label: 'Third tier', note: 'Split equally among winners' },
]


export default async function HomePage() {
  const { featuredCharity, latestDraw, subscriberCount } = await getHomepageData();
  return (
    <div className="space-y-10 pb-24 overflow-y-auto scroll-smooth ">
      <HeroSection prizePool={latestDraw.prizePool} subscriberCount={subscriberCount} />
      {/* How it works Section */}
      <section id='how-it-works' className="max-w-7xl mx-auto px-6 space-y-12 scroll-mt-20">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How it works</h2>
          <p className="text-zinc-500 max-w-150 mx-auto text-lg">Three simple steps. No complicated rules.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item) => <StepCard key={item.step} {...item} />)}
        </div>
      </section>

      {/* Prize Pool Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <h2 className="text-4xl font-bold tracking-tight">Monthly prize pool</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                Every subscription contributes to the prize pool. Match your golf scores against the drawn numbers to win.
              </p>
              {/* Jackpot Rollover Note */}
              <div className="p-6 rounded-2xl bg-white border border-amber-100 dark:bg-zinc-950 dark:border-amber-900/30">
                <h3 className="font-bold text-amber-900 dark:text-amber-400 flex items-center gap-2">
                  <span>🔥</span> Jackpot Rollover
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-500/80 mt-2">
                  Unclaimed jackpot pools carry forward, creating massive winning opportunities.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRIZE_TIERS.map((tier) => <PrizeTier key={tier.match} tier={tier} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Draw Mechanics & Latest Results */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-zinc-200 dark:border-zinc-800 pb-16">

          <div>
            <h3 className="font-bold text-lg mb-3">Scores are tickets</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">Stableford scores become your numbers automatically. No manual picking required.</p>
          </div>
          {/* ... Other Mechanics ... */}
        </div>

        {/* Latest Result Teaser */}
        {latestDraw && (
          <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-zinc-900 text-zinc-50 dark:bg-white dark:text-zinc-900 overflow-hidden relative">
            <p className="text-xs font-black uppercase tracking-[0.3em] mb-6 opacity-60">Latest Result</p>
            <div className="flex gap-4">
              {latestDraw.drawnNumbers.map((n: number) => (
                <div key={n} className="h-14 w-14 rounded-full border border-white/20 dark:border-black/10 flex items-center justify-center text-2xl font-black tabular-nums">
                  {n}
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm font-medium">
              {MONTH_NAMES[latestDraw.month]} {latestDraw.year}
            </p>
          </div>
        )}
      </section>

      {/* Featured Charity */}
      {featuredCharity && (
        <section className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Charity Spotlight</h2>
            <Link href="/charities" className="text-sm font-bold text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:text-zinc-900 transition-colors">Browse all →</Link>
          </div>
          <CharitySpotlight charity={featuredCharity} />
        </section>
      )}

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center space-y-8 bg-zinc-900 rounded-[3rem] text-white dark:bg-white dark:text-zinc-900 shadow-2xl">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Ready to play?</h2>
        <p className="text-zinc-400 dark:text-zinc-500 text-lg">
          Join {subscriberCount} players supporting causes they care about.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={'/dashboard/scores'} className="px-8 py-4 rounded-full bg-zinc-50 text-zinc-900 font-bold text-lg hover:bg-zinc-200 dark:hover:bg-zinc-950 dark:bg-zinc-800 dark:text-zinc-50">
            Subscribe Now
          </Link>
        </div>
      </section>

      {/* Footer can be its own component too */}
    </div>
  );
}