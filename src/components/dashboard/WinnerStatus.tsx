import { WinnerStatus } from '@/types/draw'
import {
    Clock,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Wallet
} from 'lucide-react'

interface Props {
    status: WinnerStatus
    adminNote: string
    reviewedAt: string
    paidAt: string
}

export default function WinnerStatusView({ status, adminNote, reviewedAt, paidAt }: Props) {
    const configs: Record<WinnerStatus, {
        title: string
        desc: string
        icon: typeof Clock
        animate?: boolean
        time?: string
        adminNote?: string
    }> = {
        pending: {
            title: 'Action Required',
            desc: 'Please upload your scorecard proof to initiate verification.',
            icon: AlertCircle,
        },
        proof_submitted: {
            title: 'Audit in Progress',
            desc: 'Our team is manually verifying your scores. Usually takes 24-48h.',
            icon: Clock,
            animate: true,
        },
        approved: {
            title: 'Winner Verified',
            desc: 'Your proof has been approved. Payout is being scheduled.',
            icon: ShieldCheck,
            time: 'Reviewed on ' + (new Date(reviewedAt).toLocaleDateString()),
            adminNote: adminNote
        },
        paid: {
            title: 'Prize Disbursed',
            desc: 'Funds have been sent to your registered payment method.',
            icon: Wallet,
            time: 'Reviewed on ' + (new Date(paidAt).toLocaleDateString()),
            adminNote: adminNote,
        },
        rejected: {
            title: 'Verification Failed',
            desc: 'The provided proof did not match our records. Check your email.',
            icon: XCircle,
            adminNote: adminNote,
            time: 'Reviewed on ' + (new Date(reviewedAt).toLocaleDateString())
        },
    }

    const current = configs[status]
    const Icon = current.icon

    return (
        <div className="py-10 text-center space-y-5 bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-500">
            {/* Icon Container */}
            <div className="relative inline-flex size-20 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                <Icon className={`h-10 w-10 text-zinc-900 dark:text-zinc-50 ${current.animate ? 'animate-pulse' : ''}`} />
                {/* Secondary Decorative Ring */}
                <div className="absolute inset-0 rounded-full border border-zinc-900/5 dark:border-white/5 animate-ping duration-3000" />
            </div>
            {/* Text Content */}
            <div className="space-y-2 px-6">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-50 leading-none">
                    {current.title}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 max-w-100 mx-auto leading-relaxed">
                    {current.desc}
                </p>
                {adminNote && (
                    <p className="mt-4 text-sm italic text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                        &ldquo;{adminNote}&rdquo;
                    </p>
                )}
            </div>

            {/* Status-specific Footer Note (Optional) */}
            {status === 'paid' && (
                <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    <CheckCircle2 className="h-3 w-3" /> Transaction Confirmed
                </div>
            )}
        </div>
    )
}