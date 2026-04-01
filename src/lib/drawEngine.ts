import { DrawMode, MatchType } from "@/models/Draw"
import { DrawSummary, MatchResult, PrizeBreakdown, WinnerPayout } from "@/types/draw"


//Constants 
const SCORE_MIN = 1
const SCORE_MAX = 45
const DRAW_COUNT = 5

const PRIZE_SPLIT = {
    five: 0.40,
    four: 0.35,
    three: 0.25,
} as const


//  1 - Number Generation 

//Random mode pure Lottery  , 5 unique numbers from 1 to 45
export const drawRandom = (): number[] => {
    const pool = Array.from({ length: SCORE_MAX }, (_, i) => i + 1)
    const drawn: number[] = []

    for (let i = 0; i < DRAW_COUNT; i++) {
        const randIndex = Math.floor(Math.random() * pool.length)
        drawn.push(pool[randIndex])
        pool.splice(randIndex, 1)
    }

    return drawn.sort((a, b) => a - b)
}


/*
Weighted mode - number that appeals more frequently in user scores , are more likely to be drawn

 @param allUsersScores - flat array of all score values from all active subscribers
*/

export function drawWeighted(allUserScores: number[]): number[] {
    //fallback to random if no score exists yet 
    if (allUserScores.length === 0) {
        return drawRandom()
    }
    //building frequency map 
    const freq = new Map<number, number>()
    for (const score of allUserScores) {
        if (score <= SCORE_MIN && score >= SCORE_MAX) {
            freq.set(score, (freq.get(score) ?? 0) + 1)
        }
    }

    //building weighted pool - number appears N times proportional to their frequency
    //Numbers never appearing get weight of 1 so they're still eligible
    const weightPool: number[] = []
    for (let i = SCORE_MIN; i <= SCORE_MAX; i++) {
        const weight = freq.get(i) ?? 1
        for (let w = 0; w < weight; w++) {
            weightPool.push(i)
        }
    }

    //Pick 5 unique numbers from the weighted pool 
    const drawn: number[] = []
    const usedNumbers = new Set<number>()

    let attempts = 0
    while (drawn.length < DRAW_COUNT && attempts < 100) {
        attempts++
        const idx = Math.floor(Math.random() * weightPool.length)
        const num = weightPool[idx]
        if (!usedNumbers.has(num)) {
            drawn.push(num)
            usedNumbers.add(num)
        }
    }

    //Safety - should never hit this 
    if (drawn.length < DRAW_COUNT) {
        console.warn('[DrawEngine] weighted draw fell back to random for remaining numbers')
        const remaining = Array.from({ length: SCORE_MAX }, (_, i) => i + 1).filter(n => !usedNumbers.has(n))
        while (drawn.length < DRAW_COUNT && remaining.length > 0) {
            const idx = Math.floor(Math.random() * remaining.length)
            drawn.push(remaining[idx])
            remaining.splice(idx, 1)
        }
    }
    return drawn.sort((a, b) => a - b)
}


// 2- Match Checker 

/**
 * Check a single user's scores against drawn numbers.
 * Returns the best match only (five > four > three).
 * Returns null if fewer than 3 matches.
 *
 * @param userId       - user's ID string
 * @param userScores   - user's up-to-5 score values
 * @param drawnNumbers - the 5 drawn numbers
 */


export function checkUserMatch(
    userId: string, userScores: number[], drawnNumbers: number[]
): MatchResult | null {
    const drawnSet = new Set(drawnNumbers)
    const matched = userScores.filter(s => drawnSet.has(s))


    if (matched.length >= 5) {
        return { userId, matchType: 'five', matchedNumbers: matched.slice(0, 5) }
    }
    if (matched.length === 4) {
        return { userId, matchType: 'four', matchedNumbers: matched }
    }
    if (matched.length === 3) {
        return { userId, matchType: 'three', matchedNumbers: matched }
    }

    return null

}

/**
 * Check all subscribers in one pass.
 *
 * @param subscribers  - array of { userId, scores: number[] }
 * @param drawnNumbers - the 5 drawn numbers
 */


export function checkAllMatches(
    subscribers: { userId: string; scores: number[] }[],
    drawnNumbers: number[]
): MatchResult[] {
    const res: MatchResult[] = []
    for (const sub of subscribers) {
        const match = checkUserMatch(sub.userId, sub.scores, drawnNumbers)
        if (match) res.push(match)
    }
    return res
}


// 3- Price Pool Calculator  

/**
 * Calculate prize pool tiers from the total pool amount.
 * Jackpot rollover is added on top of the five-match pool.
 *
 * @param totalPaise        - total prize pool in paise
 * @param jackpotCarryover  - rolled-over jackpot from previous month (in paise)
 */

export function calculatePrizePool(
    totalPaise: number,
    jackpotCarryover: number = 0
): PrizeBreakdown {
    const five = Math.floor(totalPaise * PRIZE_SPLIT.five) + jackpotCarryover
    const four = Math.floor(totalPaise * PRIZE_SPLIT.four)
    const three = Math.floor(totalPaise * PRIZE_SPLIT.three)

    return {
        total: totalPaise,
        five,
        four,
        three,
    }
}


/**
 * Calculate individual payouts — splits tier pool equally among winners.
 * If no five-match winner, jackpot rolls over to next month.
 *
 * @param matches       - all match results from checkAllMatches
 * @param prizePool     - calculated prize pool breakdown
 */

export function calculatePayouts(
    matches: MatchResult[],
    prizePool: PrizeBreakdown
): { payouts: WinnerPayout[]; jackpotRolledToNext: boolean } {
    const byTier: Record<MatchType, MatchResult[]> = {
        five: matches.filter(m => m.matchType === 'five'),
        four: matches.filter(m => m.matchType === 'four'),
        three: matches.filter(m => m.matchType === 'three')
    }
    const payouts: WinnerPayout[] = []
    const jackpotRolledToNext = byTier.five.length === 0
    for (const tr of ['five', 'four', 'three'] as MatchType[]) {
        const trWinner = byTier[tr]
        if (trWinner.length === 0) continue

        //Skip five matches payout  if rolling over - still give 4 and 3 matches winners
        if (tr === 'five' && jackpotRolledToNext) continue

        const trPool = prizePool[tr]
        const perWinner = Math.floor(trPool / trWinner.length)

        for (const wn of trWinner) {
            payouts.push({
                userId: wn.userId,
                matchType: wn.matchType,
                matchedNumbers: wn.matchedNumbers,
                prizeAmount: perWinner
            })
        }
    }
    return { payouts, jackpotRolledToNext }
}


// 4-Full Draw Runner 

/**
 * Runs the complete draw in one call.
 * Used by both simulate and publish actions.
 *
 * @param opts.mode              - 'random' | 'weighted'
 * @param opts.subscribers       - all active subscribers with their scores
 * @param opts.prizePerSubscriber- how much each subscriber contributes to prize pool (in paise)
 * @param opts.jackpotCarryover  - rolled-over jackpot from previous month
 */


export function runDraw(opts: {
    mode: DrawMode
    subscribers: { userId: string; scores: number[] }[]
    prizePerSubscriber: number
    jackpotCarryover: number
}): DrawSummary {
    const { mode, subscribers, prizePerSubscriber, jackpotCarryover } = opts

    // 1. Generate drawn numbers
    const allScores = subscribers.flatMap((s) => s.scores)
    const drawnNumbers = (mode === 'weighted') ? drawWeighted(allScores) : drawRandom()

    // 2. Check all matches
    const matches = checkAllMatches(subscribers, drawnNumbers)

    // 3. Calculate prize pool
    const totalPaise = subscribers.length * prizePerSubscriber
    const prizePool = calculatePrizePool(totalPaise, jackpotCarryover)

    // 4. Calculate individual payouts
    const { payouts, jackpotRolledToNext } = calculatePayouts(matches, prizePool)

    return {
        drawnNumbers,
        mode,
        prizePool,
        winners: payouts,
        jackpotRolledToNext,
    }
}

// 5. Helpers 

/**
 * Get the prize contribution per subscriber per plan type.
 * This is the portion of the subscription fee that goes to the prize pool.
 * Adjust percentages here if business rules change.
 */
export function getPrizeContributionPaise(plan: 'monthly' | 'yearly'): number {
    // Monthly: ₹999 → 50% to prize pool → ₹499.50 → 49900 paise (floor)
    // Yearly:  ₹9999 / 12 months → ₹833.25/mo → 50% → ₹416.62 -> 41600 paise(floor)
    const contributions = {
        monthly: 49900,
        yearly: 41600,
    }
    return contributions[plan]
}

/**
 * Format paise to INR display string.
 * e.g. 99900 → "₹999"
 */
export function formatINR(paise: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(paise / 100)
}