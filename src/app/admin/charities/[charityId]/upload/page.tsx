// app/admin/charities/[id]/media/page.tsx
import { connectDB } from '@/lib/db'
import Charity from '@/models/Charity'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ImageIcon, Layout } from 'lucide-react'
import CharityMediaForm from './CharityUploadForm'

interface Props {
    params: Promise<{ charityId: string }>
}
export default async function CharityMediaPage({ params }: Props) {
    const { charityId } = await params
    await connectDB()
    const charity = await Charity.findById(charityId).select('name coverImage images').lean()
    if (!charity) notFound()

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
            {/* Header Navigation */}
            <header className="space-y-4">
                <Link
                    href={`/admin/charities/${charityId}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Charity Details
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase">
                                Media Assets
                            </h1>
                            <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                Step 02
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                            Manage visuals for <span className="text-zinc-900 dark:text-zinc-200 font-bold">{charity.name}</span>
                        </p>
                    </div>

                    <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <ImageIcon className="h-5 w-5 text-zinc-400" />
                    </div>
                </div>
            </header>

            {/* The Client Form */}
            <CharityMediaForm
                charityId={charityId}
                currentCover={charity.coverImage}
                currentGallery={charity.images || []}
            />
        </div>
    )
}