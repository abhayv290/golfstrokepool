import { redirect } from 'next/navigation'
import { connectDB } from '@/lib/db'
import Charity from '@/models/Charity'
import CharityForm from '../CharityForm'
import Link from 'next/link'
import { ChevronLeft, PencilLine } from 'lucide-react'

interface Props {
    params: Promise<{ charityId: string }>
}

export default async function EditCharityPage({ params }: Props) {
    await connectDB()
    const { charityId } = await params
    const charity = await Charity.findById(charityId).lean()

    if (!charity) redirect('/admin/charities')

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8">
            {/* Breadcrumb / Back Navigation */}
            <header className="space-y-4">
                <Link
                    href="/admin/charities"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors group"
                >
                    <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Charities
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {charity.name}
                            </h1>
                            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                Edit Mode
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
                            Updating record for <span className="font-mono text-zinc-700 dark:text-zinc-300">ID: {charityId}</span>.
                            Changes will reflect immediately across the platform upon saving.
                        </p>
                    </div>

                    <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <PencilLine className="h-5 w-5 text-zinc-400" />
                    </div>
                </div>
            </header>

            {/* Form Section */}
            <div className="pt-2">
                <CharityForm
                    mode="edit"
                    charityId={charity._id.toString()}
                    defaultValues={{
                        name: charity.name,
                        slug: charity.slug,
                        description: charity.description,
                        shortDescription: charity.shortDescription,
                        category: charity.category,
                        country: charity.country,
                        website: charity.website ?? '',
                        featured: charity.featured,
                        active: charity.active,
                    }}
                />
            </div>
        </div>
    )
}