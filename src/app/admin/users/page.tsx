import { getUsersAction } from '@/actions/admin'
import Link from 'next/link'
import { Search, RotateCcw, UserCircle, Edit2 } from 'lucide-react'

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string }>
}) {
    const { search, status } = await searchParams
    const result = await getUsersAction({
        search: search ?? undefined, status: status ?? undefined
    })
    const users = result.data ?? []

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Users</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage <span className="font-semibold text-zinc-900 dark:text-zinc-200">{users.length}</span> registered members
                    </p>
                </div>

                {/* Search + Filter Form */}
                <form method="GET" className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            name="search"
                            defaultValue={search ?? ''}
                            placeholder="Search name or email..."
                            className="h-10 w-full md:w-64 rounded-lg border border-zinc-200 bg-white pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-300"
                        />
                    </div>

                    <select
                        name="status"
                        defaultValue={status ?? ''}
                        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="lapsed">Lapsed</option>
                    </select>

                    <button
                        type="submit"
                        className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                    >
                        Filter
                    </button>

                    <Link
                        href="/admin/users"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-50"
                        title="Clear filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Link>
                </form>
            </div>

            {/* Table Container */}
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Member</th>
                                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Role</th>
                                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Subscription</th>
                                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50">Joined</th>
                                <th className="px-6 py-4 font-semibold text-zinc-900 dark:text-zinc-50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {users.map((u) => (
                                <tr key={u._id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                                <UserCircle className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                                                <span className="text-xs text-zinc-500 leading-none mt-1">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 capitalize font-medium text-zinc-600 dark:text-zinc-400">
                                        {u.role}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                                            ${u.subscriptionStatus === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                            {u.subscriptionStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/users/${u._id}`}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:text-zinc-50 transition-all"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400 mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">No users found</h3>
                        <p className="text-xs text-zinc-500 mt-1">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    )
}