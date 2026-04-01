import { DrawMode, MatchType } from "@/models/Draw"

export interface MatchResult {
    userId: string
    matchType: MatchType
    matchedNumbers: number[]
}

export interface PrizeBreakdown {
    total: number
    five: number
    four: number
    three: number
}

export interface WinnerPayout {
    userId: string
    matchType: MatchType
    matchedNumbers: number[]
    prizeAmount: number
}

export interface DrawSummary {
    drawnNumbers: number[]
    mode: DrawMode
    prizePool: PrizeBreakdown
    winners: WinnerPayout[]
    jackpotRolledToNext: boolean
}


export interface DrawResultClient {
    _id: string
    month: number
    year: number
    drawnNumbers: number[]
    mode: DrawMode
    status: 'pending' | 'published' | 'simulated'
    prizePool: PrizeBreakdown
    jackpotRolledToNext: boolean
    subscriberCountAtDraw: number
    jackpotCarriedOver: number
    totalFormatted: string
    fiveFormatted: string
    fourFormatted: string
    threeFormatted: string
    publishedAt?: string
}


export interface WinnerClient {
    _id: string
    userId: string
    userName: string
    userEmail: string
    matchType: 'five' | 'four' | 'three'
    matchedNumbers: number[]
    prizeAmount: number
    prizeFormatted: string
    status: string
}