'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { resetPasswordAction } from '@/actions/password'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button, LoadingSwap } from '@/components/ui/Button'

interface Fields {
    newPassword: string
    confirmPassword: string
}

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') ?? ''
    const [isPending, startTransition] = useTransition()
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<Fields>({ mode: 'onTouched' })

    // if (!email) {
    //     router.replace('/forgot-password')
    //     return null
    // }

    const newPasswordValue = watch('newPassword')

    const onSubmit = (data: Fields) => {
        const formData = new FormData()
        formData.set('email', email)
        formData.set('newPassword', data.newPassword)

        startTransition(async () => {
            const res = await resetPasswordAction(formData)
            if (res.error) {
                toast.error(res.message)
                return
            }
            toast.success('Password updated successfully')
            router.push('/login?reset=success')
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
                    Start over
                </Link>

                <div className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4 shadow-xl shadow-black/50">
                            <Lock className="w-6 h-6 text-zinc-100" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Set new password</h1>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                            Choose a strong password for <span className="text-zinc-200">{email}</span>.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic px-1">
                                New Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    {...register('newPassword', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Minimum 6 characters' },
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                            message: 'Must include uppercase, lowercase, and a number',
                                        },
                                    })}
                                    className={`
                                        w-full bg-zinc-900 border ${errors.newPassword ? 'border-red-900/50' : 'border-zinc-800'} 
                                        rounded-lg py-2.5 pl-10 pr-10 text-sm text-zinc-100 placeholder:text-zinc-800
                                        focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-700
                                        transition-all shadow-inner shadow-black/40
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.newPassword && (
                                <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-tight px-1 leading-tight">
                                    {errors.newPassword.message}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            variant='primary'
                            className="w-full"
                        >
                            <LoadingSwap isLoading={isPending}>Save New Password</LoadingSwap>
                        </Button>
                    </form>
                </div>
            </div>
        </main>
    )
}