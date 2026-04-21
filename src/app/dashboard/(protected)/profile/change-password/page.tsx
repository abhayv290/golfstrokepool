'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { changePasswordAction } from '@/actions/password'
import toast from 'react-hot-toast'
import { Button, LoadingSwap } from '@/components/ui/Button'
import { Lock, ShieldCheck, KeyRound } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Fields {
    currentPassword: string
    newPassword: string
}

export default function ChangePasswordForm() {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Fields>({ mode: 'onTouched' })

    const onSubmit = (data: Fields) => {
        const formData = new FormData()
        formData.set('currentPassword', data.currentPassword)
        formData.set('newPassword', data.newPassword)

        startTransition(async () => {
            const res = await changePasswordAction(formData)
            if (res.error) {
                toast.error(res.message)
                return
            }
            toast.success('Password Updated Successfully')
            router.replace('/dashboard/profile')
        })
    }

    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
                <h2 className="font-semibold text-zinc-200">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="currentPassword"
                            className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic px-1"
                        >
                            Current Password
                        </label>
                        <div className="relative group">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
                            <input
                                id="currentPassword"
                                type="password"
                                autoComplete="current-password"
                                {...register('currentPassword', { required: 'Current password is required' })}
                                className={`
                                    w-full bg-zinc-950 border ${errors.currentPassword ? 'border-red-900/50' : 'border-zinc-800'} 
                                    rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-800
                                    focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-700
                                    transition-all shadow-inner shadow-black/40
                                `}
                            />
                        </div>
                        {errors.currentPassword && (
                            <p className="text-[10px] font-bold text-red-500/80 uppercase px-1">{errors.currentPassword.message}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label
                            htmlFor="newPassword"
                            className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest italic px-1"
                        >
                            New Password
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
                            <input
                                id="newPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Min. 6 characters"
                                {...register('newPassword', {
                                    required: 'New password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' },
                                    pattern: {
                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                        message: 'Must include uppercase, lowercase, and a number',
                                    },
                                })}
                                className={`
                                    w-full bg-zinc-950 border ${errors.newPassword ? 'border-red-900/50' : 'border-zinc-800'} 
                                    rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-800
                                    focus:outline-none focus:ring-2 focus:ring-zinc-800 focus:border-zinc-700
                                    transition-all shadow-inner shadow-black/40
                                `}
                            />
                        </div>
                        {errors.newPassword && (
                            <p className="text-[10px] font-bold text-red-500/80 uppercase px-1 leading-tight">{errors.newPassword.message}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        variant='primary'
                        disabled={isPending}
                        className="w-50 sm:w-auto"
                        type='submit'
                    >
                        <LoadingSwap isLoading={isPending}>Update Password</LoadingSwap>
                    </Button>
                </div>
            </form>
        </section>
    )
}