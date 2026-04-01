export type UserRole = 'admin' | 'subscriber'

export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed'

export interface JWTPayload {
    userId: string
    email: string
    role: UserRole
    subscriptionStatus: SubscriptionStatus
    iat?: number
    exp?: number
}


export interface AuthUser {
    userId: string
    email: string
    name: string;
    role: UserRole;
    subscriptionStatus: SubscriptionStatus
}

export interface ActionResult<T = void> {
    error: boolean;
    message: string;
    data?: T
}

