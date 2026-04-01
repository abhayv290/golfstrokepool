export interface UserListItem {
    _id: string
    name: string
    email: string
    role: string
    subscriptionStatus: string
    createdAt: string
}

export interface UserDetails extends UserListItem {
    razorpayCustomerId?: string
    razorpaySubscriptionId?: string
    subscriptionEnd?: string
    charityContributionPercent: number
    scores: { _id: string, value: number, datePlayed: string }[]
}


export interface WinnerAdminItem {
    _id: string
    userId: string
    userName: string
    userEmail: string
    drawId: string
    drawMonth: number
    drawYear: number
    matchType: string
    matchedNumbers: number[]
    prizeAmount: number
    status: string
    proofUrl?: string
    adminNote?: string
    createdAt: string
}

export interface CharityListItem {
    _id: string
    name: string
    slug: string
    category: string
    country: string
    featured: boolean
    active: boolean
    totalRaised: number
}