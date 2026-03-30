import { cookies } from "next/headers";
import { verifyToken } from "./jwt";


export const COOKIE_NAME = 'golf_token'

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,  //7 days in seconds
    path: '/'
}


export async function setAuthCookies(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS)
}

export async function clearAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 })
}

export async function getAuthUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}

