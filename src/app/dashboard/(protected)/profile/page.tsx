import { redirect } from 'next/navigation'
import { getSessionUser } from '@/actions/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Charity from '@/models/Charity'
import Link from 'next/link'
// Import Lucide Icons
import {
    User as UserIcon,
    Mail,
    Shield,
    Calendar,
    CreditCard,
    Heart,
    ExternalLink,
    Zap,
    Settings
} from 'lucide-react'

async function getUserProfile(userId: string) {
    await connectDB()
    const user = await User.findById(userId).lean()
    if (!user) return null

    const charity = user.selectedCharityId
        ? await Charity.findById(user.selectedCharityId).lean()
        : null

    return { user, charity }
}

const STATUS_LABEL: Record<string, string> = {
    active: 'Active',
    inactive: 'Inactive',
    cancelled: 'Cancelled',
    lapsed: 'Lapsed',
}

export default async function ProfilePage() {
    const session = await getSessionUser()
    if (!session) redirect('/login')

    const data = await getUserProfile(session.userId)
    if (!data) redirect('/login')

    const { user, charity } = data

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex items-center justify-between border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                            <Settings className="w-6 h-6 text-zinc-500" />
                            Account Settings
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1 font-medium">Manage your profile and personal preferences.</p>
                    </div>
                </header>

                {/* ── Personal Info ─────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <UserIcon className="w-4 h-4 text-zinc-500" />
                        <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Personal Info</h2>
                    </div>
                    <div className="grid gap-px bg-zinc-800 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                        <InfoTile icon={<UserIcon className="w-3.5 h-3.5" />} label="Full Name" value={user.name} />
                        <InfoTile icon={<Mail className="w-3.5 h-3.5" />} label="Email Address" value={user.email} />
                        <InfoTile icon={<Shield className="w-3.5 h-3.5" />} label="Account Role" value={user.role} className="capitalize text-zinc-400" />
                        <InfoTile
                            icon={<Calendar className="w-3.5 h-3.5" />}
                            label="Joined"
                            value={new Date(user.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        />
                    </div>
                </section>

                {/* ── Subscription ──────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-zinc-500" />
                            <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Subscription</h2>
                        </div>
                        <div className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-tight ${user.subscriptionStatus === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                            }`}>
                            {STATUS_LABEL[user.subscriptionStatus] ?? user.subscriptionStatus}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6 grid gap-8 sm:grid-cols-2">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase italic">Current Plan</span>
                                <p className="text-lg font-semibold text-zinc-100">{(user as any).subscriptionPlan?.toUpperCase() || 'FREE'}</p>
                            </div>
                            {user.subscriptionEnd && (
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase italic">
                                        {user.subscriptionStatus === 'cancelled' ? 'Access Ends' : 'Next Billing Date'}
                                    </span>
                                    <p className="text-sm font-medium text-zinc-200">
                                        {new Date(user.subscriptionEnd).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Footer */}
                        {user.subscriptionStatus !== 'active' && (
                            <div className="p-4 border-t border-zinc-800 bg-zinc-950/40">
                                <Link
                                    href="/dashboard/subscribe"
                                    className="flex items-center justify-center gap-2 w-full sm:w-max bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold py-2.5 px-6 rounded-lg transition-all active:scale-[0.98]"
                                >
                                    <Zap className="w-3.5 h-3.5 fill-current" />
                                    Upgrade to Pro
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Charity ───────────────────────────────────────────────────── */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Heart className="w-4 h-4 text-zinc-500" />
                        <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Social Impact</h2>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
                        {/* Subtle Background Icon Decoration */}
                        <Heart className="absolute -bottom-4 -right-4 w-24 h-24 text-zinc-800/20" />

                        {charity ? (
                            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-tighter italic">Currently Supporting</p>
                                    <p className="text-xl font-semibold text-zinc-100">{charity.name}</p>
                                    <p className="text-xs text-zinc-400">
                                        <span className="text-emerald-500 font-bold">{user.charityContributionPercent}%</span> of your monthly fee is donated.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link
                                        href={`/charities/${charity.slug}`}
                                        className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-zinc-100 transition-colors"
                                    >
                                        Details <ExternalLink className="w-3 h-3" />
                                    </Link>
                                    <Link
                                        href="/dashboard/charity"
                                        className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 px-4 rounded-lg border border-zinc-700 transition-colors"
                                    >
                                        Change Charity
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 text-center py-4">
                                <p className="text-sm text-zinc-500 mb-4">You haven&apos;t selected a charity yet.</p>
                                <Link
                                    href="/dashboard/charity"
                                    className="inline-flex items-center gap-2 text-xs font-bold bg-zinc-100 text-zinc-950 py-2.5 px-6 rounded-lg"
                                >
                                    <Heart className="w-3.5 h-3.5 fill-current" />
                                    Choose a Cause
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}

/**
 * Tile Component with Icon support
 */
function InfoTile({
    label,
    value,
    icon,
    className = ""
}: {
    label: string,
    value: string,
    icon: React.ReactNode,
    className?: string
}) {
    return (
        <div className="bg-zinc-900 p-4 flex items-start gap-4 hover:bg-zinc-900/80 transition-colors">
            <div className="mt-1 text-zinc-600">{icon}</div>
            <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter italic">{label}</span>
                <span className={`text-sm text-zinc-200 font-medium ${className}`}>{value}</span>
            </div>
        </div>
    )
}