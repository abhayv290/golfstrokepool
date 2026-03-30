import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "./lib/session";
import { verifyToken } from "./lib/jwt";


export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(COOKIE_NAME)?.value
    const payload = token ? verifyToken(token) : null
    const isAuthenticated = !!payload

    //Admin Routes 
    if (pathname.startsWith('/admin')) {
        if (!isAuthenticated) {
            return NextResponse.redirect(new URL('/login?next=/admin', request.url))
        }
        if (payload?.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    //protected dashboard routes 
    if (pathname.startsWith('/dashboard')) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('next', pathname)
            return NextResponse.redirect(loginUrl)
        }

        //page acceesible without active subscription 
        const SUBS_EXEMPT = [
            '/dashboard/subscribe', '/dashboard/settings/'
        ]

        const isExempt = SUBS_EXEMPT.some(p => pathname.startsWith(p))

        if (!isExempt && payload?.subscriptionStatus !== 'active') {
            return NextResponse.redirect(new URL('/dashboard/subscribe', request.url))
        }
        return NextResponse.next()
    }

    //Redirect User after Login/Signup
    if (['/login', '/register'].includes(pathname) && isAuthenticated) {
        const next = request.nextUrl.searchParams.get('next')
        return NextResponse.redirect(new URL(next ?? '/dashboard', request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register']
}