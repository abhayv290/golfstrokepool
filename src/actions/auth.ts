'use server'

import { connectDB } from "@/lib/db"
import { signToken } from "@/lib/jwt"
import { clearAuthCookie, setAuthCookies } from "@/lib/session"
import User from "@/models/User"
import { ActionResult, AuthUser } from "@/types/auth"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"


//Register The User

export async function registerAction(
    formdata: FormData
): Promise<ActionResult<AuthUser>> {
    const name = (formdata.get('name') as string)?.trim()
    const email = (formdata.get('email') as string)?.trim().toLowerCase()
    const password = (formdata.get('password') as string)?.trim()

    if (password.length < 6) {
        return { error: true, message: 'Password must be at least 6 chars' }
    }

    try {
        await connectDB()
        const existing = await User.findOne({ email })
        if (existing) {
            return { error: true, message: 'User Already Exists' }
        }
        const passwordHash = await bcrypt.hash(password, 10)
        const user = await User.create({
            name, email, passwordHash, role: 'subscriber',
            subscriptionStatus: 'inactive'
        })

        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            subscriptionStatus: user.subscriptionStatus
        })

        await setAuthCookies(token)

        return {
            error: false, message: 'User Registered', data: {
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                subscriptionStatus: user.subscriptionStatus
            }
        }
    } catch (err) {
        console.error('registerAction', err)
        return { error: true, message: 'Something went wrong' }
    }
}

export async function LoginAction(formdata: FormData): Promise<ActionResult<AuthUser>> {
    const email = (formdata.get('email') as string).trim().toLocaleLowerCase()
    const password = (formdata.get('password') as string).trim()
    try {
        await connectDB()

        const user = await User.findOne({ email }).select('+passwordHash')
        if (!user) {
            return {
                error: true, message: 'Invalid Credentials'
            }
        }
        const isValid = await bcrypt.compare(password, user.passwordHash)
        if (!isValid) {
            return {
                error: true, message: 'Invalid Credentials'
            }
        }

        //Assigning the tokens 
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            subscriptionStatus: user.subscriptionStatus
        })

        await setAuthCookies(token)

        return {
            error: false,
            message: 'Logged In',
            data: {
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                subscriptionStatus: user.subscriptionStatus
            }
        }

    } catch (err) {
        console.error('LoginAction', err)
        return {
            error: true,
            message: 'Something went wrong'
        }
    }
}

export async function LogoutAction() {
    await clearAuthCookie()
    return redirect('/')
}


//Get Current Session 
export async function getSessionUser(): Promise<AuthUser | null> {
    const { getAuthUser } = await import('@/lib/session')
    const payload = await getAuthUser()
    if (!payload) return null

    try {
        await connectDB()
        const user = await User.findById(payload.userId).lean()
        if (!user) return null

        return {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionEnd: user.subscriptionEnd ? user.subscriptionEnd.toISOString() : undefined
        }
    } catch (err) {
        console.error(err)
        return null
    }
}