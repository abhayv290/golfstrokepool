// components/dashboard/home/SubscriptionCard.tsx
import { AuthUser } from '@/types/auth'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionCard({ user }: { user: AuthUser }) {
    const isActive = user.subscriptionStatus === 'active'
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <ShieldCheck className={isActive ? 'text-emerald-500' : 'text-zinc-300'} />
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                    {user.subscriptionStatus}
                </span>
            </div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50">Membership</h3>
            <p className="text-xs text-zinc-500 mt-1">
                {isActive ? `Renews on ${user.subscriptionEnd?.split('T')[0]}` : 'Subscription is currently inactive'}
            </p>
            <Link href="/dashboard/profile" className="mt-4 flex items-center justify-between group">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-200 group-hover:text-zinc-800 transition-colors uppercase tracking-widest">Manage Plan</span>
                <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:translate-x-1 transition-all" />
            </Link>
        </div>
    )
}