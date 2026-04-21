'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { verifyOTPAction, requestOTPAction } from '@/actions/password'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ChevronLeft, ShieldCheck, } from 'lucide-react'
import { Button, LoadingSwap } from '@/components/ui/Button'

interface Fields { otp: string }

export default function VerifyOTPPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') ?? ''
    const [isPending, startTransition] = useTransition()
    const [isResending, startResend] = useTransition()

    const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
        mode: 'onTouched',
    })

    // Redirect back if no email in URL
    // if (!email) {
    //     router.replace('/forgot-password')
    //     return null
    // }

    const onSubmit = (data: Fields) => {
        const formData = new FormData()
        formData.set('email', email)
        formData.set('otp', data.otp.trim())

        startTransition(async () => {
            const res = await verifyOTPAction(formData)
            if (res.error) {
                toast.error(res.message)
                return
            }
            router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`)
        })
    }

    const handleResend = () => {
        const formData = new FormData()
        formData.set('email', email)

        startResend(async () => {
            await requestOTPAction(formData)
            toast.success('A new code has been sent')
        })
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-400 flex flex-col justify-start items-center p-6 selection:bg-zinc-700">
            <div className="w-full max-w-[400px] space-y-8">

                {/* Back Link */}
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-100 transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back
                </Link>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-black/50">
                            <ShieldCheck className="w-6 h-6 text-zinc-100" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Check your email</h1>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                            We sent a 6-digit code to <span className="text-zinc-200">{email}</span>.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="otp"
                                className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic px-1"
                            >
                                Verification Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="••••••"
                                aria-invalid={!!errors.otp}
                                {...register('otp', {
                                    required: 'Code is required',
                                    pattern: {
                                        value: /^\d{6}$/,
                                        message: 'Must be a 6-digit number',
                                    },
                                })}
                                className={`
                                    w-full bg-zinc-900 border ${errors.otp ? 'border-red-900/50' : 'border-zinc-800'} 
                                    rounded-lg py-3 text-center text-2xl font-mono tracking-[0.5em] text-zinc-100 placeholder:text-zinc-800
                                    focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-700
                                    transition-all shadow-inner shadow-black/40
                                `}
                            />
                            {errors.otp && (
                                <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-tight px-1 pt-1">
                                    {errors.otp.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full"
                        >
                            <LoadingSwap isLoading={isPending}>Verify Code</LoadingSwap>
                        </Button>
                    </form>

                    {/* Resend Section */}
                    <div className="pt-4 border-t border-zinc-900 text-center space-y-4">
                        <p className="text-xs text-zinc-600 font-medium">Didn&apos;t receive a code?</p>
                        <Button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            variant='primary'
                            className='w-40'
                        >
                            <LoadingSwap isLoading={isResending}>Resend</LoadingSwap>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    )
}