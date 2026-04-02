import CharityForm from '../CharityForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
    tittle: 'Add New Charity - Admin Dashboard - GolfStrokePool',
}

export default function NewCharityPage() {
    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-6">
            {/* Navigation Header */}
            <header className="flex flex-col gap-3">
                <Link
                    href="/admin/charities"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Charities
                </Link>

                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                        Add New Charity
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Register a new partner organization to receive contributions from subscribers.
                    </p>
                </div>
            </header>

            {/* Form Wrapper */}
            <div className="pt-4">
                <CharityForm mode="create" />
            </div>
        </div>
    )
}