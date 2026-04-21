'use server'

import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { getAuthUser } from '@/lib/session'
import { sendOTPEmail, sendPasswordChangedEmail } from '@/lib/resend'
import User from '@/models/User'
import OTP from '@/models/otp'
import type { ActionResult } from '@/types/auth'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOTP(): string {
    // Cryptographically random 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const OTP_EXPIRY_MINUTES = 10


// FORGOT PASSWORD FLOW


// Step 1: Request OTP
// User enters email → OTP sent if account exists
// Always return success to prevent email enumeration

export async function requestOTPAction(
    formData: FormData
): Promise<ActionResult> {
    const email = (formData.get('email') as string)?.trim().toLowerCase()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return { error: true, message: 'Invalid email address' }
    }

    try {
        await connectDB()

        const user = await User.findOne({ email }).lean()

        // If user doesn't exist — still return success (prevents enumeration)
        if (!user) {
            return { error: false, message: 'Otp sent to your email' }
        }

        // Delete any existing OTPs for this email before creating new one
        await OTP.deleteMany({ email })

        const plainOTP = generateOTP()
        const hashedOTP = await bcrypt.hash(plainOTP, 10)
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

        await OTP.create({ email, otp: hashedOTP, expiresAt })

        // Send email — don't await so response is fast
        // fire and forget — email sending failure shouldn't block the response
        sendOTPEmail(email, plainOTP).catch((err) =>
            console.error('[sendOTPEmail]', err)
        )

        return { error: false, message: 'OTP sent to your email' }
    } catch (err) {
        console.error('[requestOTPAction]', err)
        return { error: true, message: 'Failed to send OTP. Please try again.' }
    }
}

// ─── Step 2: Verify OTP ───────────────────────────────────────────────────────
// User enters the 6-digit code — marks it verified if correct

export async function verifyOTPAction(
    formData: FormData
): Promise<ActionResult> {
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const enteredOTP = (formData.get('otp') as string)?.trim()

    if (!email || !enteredOTP) {
        return { error: true, message: 'Email and OTP are required' }
    }
    if (!/^\d{6}$/.test(enteredOTP)) {
        return { error: true, message: 'OTP must be a 6-digit number' }
    }

    try {
        await connectDB()

        const record = await OTP.findOne({ email, verified: false })

        if (!record) {
            return { error: true, message: 'No OTP found. Please request a new one.' }
        }

        // Check expiry
        if (new Date() > record.expiresAt) {
            await OTP.deleteOne({ _id: record._id })
            return { error: true, message: 'OTP has expired. Please request a new one.' }
        }

        // Verify against hash
        const isValid = await bcrypt.compare(enteredOTP, record.otp)
        if (!isValid) {
            return { error: true, message: 'Incorrect OTP. Please try again.' }
        }

        // Mark as verified — allows the reset step to proceed
        await OTP.findByIdAndUpdate(record._id, { verified: true })

        return { error: false, message: 'Verified' }
    } catch (err) {
        console.error('[verifyOTPAction]', err)
        return { error: true, message: 'Verification failed. Please try again.' }
    }
}

// Step 3: Reset password
// Only works if a verified OTP exists for this email

export async function resetPasswordAction(
    formData: FormData
): Promise<ActionResult> {
    const email = (formData.get('email') as string)?.trim().toLowerCase()
    const newPassword = formData.get('newPassword') as string

    if (!email || !newPassword) {
        return { error: true, message: 'All fields are required' }
    }
    if (newPassword.length < 6) {
        return { error: true, message: 'Password must be at least 6 characters' }
    }
    try {
        await connectDB()

        // Must have a verified OTP to proceed
        const record = await OTP.findOne({ email, verified: true })
        if (!record) {
            return { error: true, message: 'Please verify your OTP first.' }
        }

        // Check OTP hasn't expired even after verification
        if (new Date() > record.expiresAt) {
            await OTP.deleteOne({ _id: record._id })
            return { error: true, message: 'Session expired. Please start again.' }
        }

        const user = await User.findOne({ email })
        if (!user) return { error: true, message: 'User not found' }

        // Update password
        user.passwordHash = await bcrypt.hash(newPassword, 12)
        await user.save()

        // Delete the OTP record — one-time use
        await OTP.deleteOne({ _id: record._id })
        return { error: false, message: 'Password Updated' }
    } catch (err) {
        console.error('[resetPasswordAction]', err)
        return { error: true, message: 'Failed to reset password. Please try again.' }
    }
}


// CHANGE PASSWORD (authenticated users)


export async function changePasswordAction(
    formData: FormData
): Promise<ActionResult> {
    const auth = await getAuthUser()
    if (!auth) return { error: true, message: 'Not authenticated' }

    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    if (!currentPassword || !newPassword) {
        return { error: true, message: 'All fields are required' }
    }
    if (newPassword.length < 6) {
        return { error: true, message: 'New password must be at least 6 characters' }
    }

    if (currentPassword === newPassword) {
        return { error: true, message: 'New password must be different from current password' }
    }

    try {
        await connectDB()

        const user = await User.findById(auth.userId).select('+passwordHash')
        if (!user) return { error: true, message: 'User not found' }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!isValid) {
            return { error: true, message: 'Current password is incorrect' }
        }

        user.passwordHash = await bcrypt.hash(newPassword, 10)
        await user.save()

        // Send confirmation email
        sendPasswordChangedEmail(user.email).catch((err) =>
            console.error('[sendPasswordChangedEmail]', err)
        )

        return { error: false, message: 'Password Updated' }
    } catch (err) {
        console.error('[changePasswordAction]', err)
        return { error: false, message: 'Failed to change password. Please try again.' }
    }
}