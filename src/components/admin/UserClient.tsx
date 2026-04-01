'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { updateUserAction, deleteUserAction } from '@/actions/admin'
import { UserDetails } from '@/types/admin'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ChevronLeft, Save, Trash2, ShieldAlert, CreditCard, ListOrdered } from 'lucide-react'
import { Button, LoadingSwap } from '../ui/Button'

interface Props {
    user: UserDetails
}

interface UserFormFields {
    name: string
    role: string
    subscriptionStatus: string
}

export default function UserEditClient({ user }: Props) {
    const router = useRouter()
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit } = useForm<UserFormFields>({
        defaultValues: {
            name: user.name,
            role: user.role,
            subscriptionStatus: user.subscriptionStatus,
        },
    })

    const onSubmit = (data: UserFormFields) => {
        setSuccess(false)
        const formData = new FormData()
        formData.set('userId', user._id)
        formData.set('name', data.name)
        formData.set('role', data.role)
        formData.set('subscriptionStatus', data.subscriptionStatus)

        startTransition(async () => {
            const res = await updateUserAction(formData)
            if (res?.error) {
                toast.error(res.message || 'Update failed')
                return
            }
            setSuccess(true)
            toast.success(res.message || 'User updated successfully')
        })
    }

    const onDelete = () => {
        if (!confirm(`Delete ${user.name}? This also deletes all their scores. This cannot be undone.`)) return
        startTransition(async () => {
            const result = await deleteUserAction(user._id)
            if (result.error) { toast.error(result.message); return }
            router.push('/admin/users')
        })
    }

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
            {/* Navigation Header */}
            <header className="space-y-4">
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to users
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{user.name}</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                            {user.email} <span className="mx-2 text-zinc-300">·</span> Joined {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                {/* 1. Account Settings Card */}
                <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Profile Settings</h2>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Full Name</label>
                                <input
                                    {...register('name', { required: true })}
                                    className="w-full h-10 rounded-lg border border-zinc-200 bg-transparent px-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none dark:border-zinc-800 dark:focus:ring-zinc-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Role</label>
                                <select
                                    {...register('role')}
                                    className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none   dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:ring-zinc-300 appearance-none"
                                >
                                    {/* Setting bg-zinc-950 specifically on options helps some browsers */}
                                    <option value="subscriber" className="bg-white dark:bg-zinc-950">Subscriber</option>
                                    <option value="admin" className="bg-white dark:bg-zinc-950">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Subscription Status</label>
                                <select
                                    {...register('subscriptionStatus')}
                                    className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:ring-zinc-300 appearance-none"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="lapsed">Lapsed</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            {success && <span className="text-sm text-emerald-600 font-medium">Changes saved successfully</span>}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="inline-flex items-center gap-2 h-10 rounded-lg bg-zinc-900 px-5 text-sm font-semibold text-zinc-50 hover:bg-zinc-800 disabled:opacity-50 transition-all dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            >
                                <Save className="h-4 w-4" />
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </section>

                {/* 2. Scores and Subscription Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Scores Section */}
                    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 font-semibold">
                            <ListOrdered className="h-4 w-4 text-zinc-400" />
                            Scores ({user.scores.length}/5)
                        </div>
                        <div className="p-0">
                            {user.scores.length === 0 ? (
                                <p className="p-8 text-center text-sm text-zinc-500">No scores entered.</p>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs uppercase text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Value</th>
                                            <th className="px-4 py-2 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {user.scores.map((s) => (
                                            <tr key={s._id}>
                                                <td className="px-4 py-3 font-bold text-zinc-900 dark:text-zinc-100">{s.value}</td>
                                                <td className="px-4 py-3 text-zinc-500">{new Date(s.datePlayed).toLocaleDateString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>

                    {/* Subscription Data Card */}
                    <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 font-semibold">
                            <CreditCard className="h-4 w-4 text-zinc-400" />
                            Billing Info
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Customer ID</span>
                                <span className="font-mono text-xs">{user.razorpayCustomerId ?? '—'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Charity Contribution</span>
                                <span className="font-medium">{user.charityContributionPercent}%</span>
                            </div>
                            {user.subscriptionEnd && (
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Valid Until</span>
                                    <span className="font-medium text-emerald-600">{new Date(user.subscriptionEnd).toLocaleDateString('en-IN')}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 3. Danger Zone */}
                <section className="rounded-xl border border-rose-200 bg-rose-50/30 dark:border-rose-900/30 dark:bg-rose-950/10 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                                <ShieldAlert className="h-4 w-4" />
                                Danger Zone
                            </div>
                            <p className="text-sm text-rose-600/80 dark:text-rose-400/60">
                                Permanently delete this account and all associated golfing history. This action is irreversible.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={onDelete}
                            disabled={isPending}

                            className=" bg-rose-500   hover:bg-rose-700 transition-colors "
                        >
                            <LoadingSwap isLoading={isPending}>
                                <Trash2 className="h-4 w-4" />
                                Delete Account
                            </LoadingSwap>

                        </Button>
                    </div>
                </section>
            </div>
        </div>
    )
}