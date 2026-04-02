'use client'

import { registerAction } from "@/actions/auth";
import { Button, LoadingSwap } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";


interface RegisterFields {
    name: string;
    email: string;
    password: string;
}

export default function RegisterPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterFields>({ 'mode': 'onTouched' })

    const onSubmit = async (data: RegisterFields) => {
        const formdata = new FormData()
        formdata.set('name', data.name)
        formdata.set('email', data.email)
        formdata.set('password', data.password)

        startTransition(async () => {
            const res = await registerAction(formdata)
            if (res?.error) {
                toast.error(res.message)
                return
            }
            reset()
            router.push('/dashboard/subscribe')
        })
    }

    return (
        <div className="min-h-screen flex items-start justify-center bg-slate-50 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 md:p-10 shadow-sm">

                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                        Join : Play • Win • Give
                    </p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Abhay Vi"
                            aria-invalid={!!errors.name}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-blue-400 aria-invalid:border-red-500"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                maxLength: { value: 80, message: 'Name is too long' },
                            })}
                        />
                        {errors.name && (
                            <p className="text-xs font-medium text-red-500 ml-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="abhay@gmail.com"
                            aria-invalid={!!errors.email}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-blue-400 aria-invalid:border-red-500"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-xs font-medium text-red-500 ml-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                            Password
                        </label>
                        <input
                            type="password" // Updated from text to password
                            id="password"
                            autoComplete="new-password"
                            placeholder="••••••••"
                            aria-invalid={!!errors.password}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 dark:bg-zinc-800 dark:border-zinc-700 dark:focus:border-blue-400 aria-invalid:border-red-500"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Minimum 6 characters required' }
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
                        className="w-full "
                    >
                        <LoadingSwap isLoading={isPending}>
                            Create Account
                        </LoadingSwap>
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 text-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href={'/login'} className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
