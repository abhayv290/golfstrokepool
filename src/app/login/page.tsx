'use client'

import { LoginAction } from "@/actions/auth"
import { Button, LoadingSwap } from "@/components/ui/Button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FieldValues, useForm } from "react-hook-form"
import toast from "react-hot-toast"

interface LoginFields {
    email: string
    password: string
}

export default function LoginPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LoginFields>()

    const onSubmit = (data: FieldValues) => {
        const form = new FormData()
        form.set('email', data.email)
        form.set('password', data.password)

        startTransition(async () => {
            const res = await LoginAction(form)
            if (res?.error) {
                toast.error(res.message)
                return
            }
            toast.success(res.message)
            reset()
            router.refresh() // Refresh to clear any stale auth state
        })
    }

    return (
        <div className="min-h-screen flex items-start justify-center bg-slate-50 p-4 dark:bg-zinc-950">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 md:p-10 shadow-sm">

                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        Join : Play • Win • Give
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            aria-invalid={!!errors.email}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-blue-400 aria-invalid:border-red-500"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: 'Please enter a valid email',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-xs font-medium text-red-500 ml-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                Password
                            </label>
                        </div>
                        <input
                            type="password" // Changed from text to password for security
                            id="password"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            aria-invalid={!!errors.password}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-blue-400 aria-invalid:border-red-500"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Must be at least 6 characters' }
                            })}
                        />
                        {errors.password && (
                            <p className="text-xs font-medium text-red-500 ml-1">{errors.password.message}</p>
                        )}
                    </div>

                    <Button
                        disabled={isPending}
                        type="submit"
                        variant="primary"
                        className="w-full"
                    >
                        <LoadingSwap isLoading={isPending}>
                            Sign In
                        </LoadingSwap>
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
                    <p className="text-sm text-muted-foreground">
                        New to Golf-Portal?{' '}
                        <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}