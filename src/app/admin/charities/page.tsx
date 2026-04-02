import { getCharitiesAdminAction, deleteCharityAction, toggleFeatureAction } from '@/actions/admin'
import { formatINR } from '@/lib/drawEngine'
import Link from 'next/link'
import { Plus, Star, Power, Edit2, Globe, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cookies } from 'next/headers'

export const metadata = {
    title: 'Charities - Admin Dashboard - GolfStrokePool',
}

export default async function AdminCharitiesPage() {
    await cookies()
    const result = await getCharitiesAdminAction()
    const charities = result.data ?? []

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <Heart className="h-6 w-6 text-rose-500" />
                        Charities
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage partner organizations and featured spotlights.
                    </p>
                </div>
                <Link href="/admin/charities/new">
                    <Button variant="primary" className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Charity
                    </Button>
                </Link>
            </div>

            {/* Table Container */}
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Charity</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Region</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Total Raised</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50 text-center">Featured</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50">Status</th>
                                <th className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {charities.map((c) => (
                                <tr key={c._id} className="group hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                                            <span className="text-xs text-zinc-500">{c.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                            <Globe className="h-3.5 w-3.5 text-zinc-400" />
                                            {c.country}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                                        {formatINR(c.totalRaised)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {c.featured ? (
                                            <Star className="h-4 w-4 text-amber-500 fill-amber-500 mx-auto" />
                                        ) : (
                                            <Star className="h-4 w-4 text-zinc-200 dark:text-zinc-800 mx-auto" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                            ${c.active
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'
                                            }`}>
                                            {c.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/charities/${c._id}`}>
                                                <Button variant="ghost" title="Edit">
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            </Link>

                                            <form action={async () => {
                                                'use server'
                                                await toggleFeatureAction(c._id, !c.featured)
                                            }}>
                                                <Button
                                                    variant="ghost"

                                                    type="submit"
                                                    title={c.featured ? 'Unfeature' : 'Feature'}
                                                    className={c.featured ? 'text-amber-500 hover:text-amber-600' : 'text-zinc-400'}
                                                >
                                                    <Star className="h-4 w-4" />
                                                </Button>
                                            </form>

                                            {c.active && (
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteCharityAction(c._id)
                                                }}>
                                                    <Button
                                                        variant="ghost"

                                                        type="submit"
                                                        title="Deactivate"
                                                        className="text-zinc-400 hover:text-rose-600"
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {charities.length === 0 && (
                    <div className="py-20 text-center">
                        <Heart className="h-10 w-10 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No charities yet</h3>
                        <p className="text-xs text-zinc-500 mt-1 mb-4">Start by adding your first partner organization.</p>
                        <Link href="/admin/charities/new">
                            <Button variant="primary">Add charity</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}