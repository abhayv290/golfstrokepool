'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { requestOTPAction } from '@/actions/password'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button, LoadingSwap } from '@/components/ui/Button'
import { Mail, ChevronLeft, KeyRound } from 'lucide-react'

interface Fields { email: string }

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, formState: { errors } } = useForm<Fields>({
        mode: 'onTouched',
    })

    const onSubmit = (data: Fields) => {
        const formData = new FormData()
        formData.set('email', data.email)

        startTransition(async () => {
            const res = await requestOTPAction(formData)
            if (res.error) {
                toast.error('Some Error Occurred')
                return
            }
            router.push(`/forgot-password/verify?email=${encodeURIComponent(data.email)}`)
        })
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-400 flex flex-col justify-start items-center p-6 selection:bg-zinc-700">
            <div className="w-full max-w-[400px] space-y-8">

                {/* Back Button */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-100 transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to login
                </Link>

                <div className="space-y-6">
                    {/* Icon & Heading */}
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-black/50">
                            <KeyRound className="w-6 h-6 text-zinc-100" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Forgot password?</h1>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                            No worries, we&apos;ll send you a 6-digit code to reset your password.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic px-1"
                            >
                                Email address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    aria-invalid={!!errors.email}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^\S+@\S+\.\S+$/,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                    className={`
                                        w-full bg-zinc-900 border ${errors.email ? 'border-red-900/50' : 'border-zinc-800'} 
                                        rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-700
                                        focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-700
                                        transition-all shadow-inner shadow-black/20
                                    `}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-tight px-1 animate-in fade-in slide-in-from-left-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            variant='primary'

                        >
                            <LoadingSwap isLoading={isPending}>Send reset code</LoadingSwap>
                        </Button>
                    </form>
                </div>

                {/* Help Footer */}
                <footer className="text-center">
                    <p className="text-xs text-zinc-600">
                        Can&apos;t access your email? <Link href="/support" className="text-zinc-400 hover:text-zinc-100 underline underline-offset-4 decoration-zinc-800 hover:decoration-zinc-400 transition-all font-medium">Contact support</Link>
                    </p>
                </footer>
            </div>
        </main>
    )
}