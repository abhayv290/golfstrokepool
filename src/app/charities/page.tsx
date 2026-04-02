import { getCharitiesAction } from '@/actions/charity'
import { formatINR } from '@/lib/drawEngine'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, Globe, Heart, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CharityCategory } from '@/models/Charity'
import { title } from 'process'


const CATEGORIES = ['health', 'education', 'environment', 'poverty', 'sports', 'community', 'other'] as CharityCategory[]


export const metadata = {
    title: 'Charities - GolfStrokePool',
    description: 'Discover the charities supported by GolfStrokePool. Every subscription helps make a difference. Explore the causes we champion and how your game can drive impact.',
    keywords: ['charities', 'causes', 'nonprofits', 'golf charity', 'social impact', 'donations', 'community support'],
}

export default async function CharitiesPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string; search?: string }>
}) {
    const { category, search } = await searchParams
    const res = await getCharitiesAction({ category, search })
    const charities = res.data ?? []

    return (
        <div className="max-w-7xl mx-auto px-6  py-5 space-y-12">
            {/* Header */}
            <header className="space-y-4">
                <Link
                    href="/"
                    className="text-sm font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 transition-colors"
                >
                    <ArrowRight className="h-4 w-4 rotate-180" /> Home
                </Link>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                            Charities
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl">
                            Every subscription supports a cause. Discover the organizations changing lives through our platform.
                        </p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest text-zinc-500">
                        {charities.length} Organizations
                    </div>
                </div>
            </header>

            {/* Search + Filter Bar */}
            <div className="sticky top-20 z-30 p-2 rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur-md shadow-sm dark:border-zinc-800 dark:bg-zinc-950/80">
                <form method="GET" className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search by name..."
                            className="h-11 w-full rounded-xl border-none bg-transparent pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                            <select
                                name="category"
                                defaultValue={category ?? ''}
                                className="h-11 rounded-xl border border-zinc-100 bg-zinc-50 pl-9 pr-8 text-xs font-bold uppercase tracking-wider outline-none appearance-none cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <option value="">All Categories</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <Button variant="primary" type="submit" className="h-11 px-6 rounded-xl">
                            Filter
                        </Button>
                        {(category || search) && (
                            <Link href="/charities">
                                <Button variant="ghost" type="button" className="h-11 w-11 p-0 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                    <X className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </form>
            </div>

            {/* Charity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {charities.map((charity) => (
                    <article
                        key={charity._id.toString()}
                        className="group flex flex-col rounded-3xl border border-zinc-200 bg-white overflow-hidden transition-all hover:shadow-xl hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                    >
                        <div className="relative aspect-16/10 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                            {charity.coverImage ? (
                                <Image
                                    src={charity.coverImage}
                                    alt={charity.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                    <Heart className="h-12 w-12" />
                                </div>
                            )}
                            {charity.featured && (
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 shadow-sm">
                                    Featured
                                </div>
                            )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                    {charity.category}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                                    <Globe className="h-3 w-3" /> {charity.country}
                                </div>
                            </div>

                            <div className="space-y-2 flex-1">
                                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                    {charity.name}
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                    {charity.shortDescription}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <div>
                                    {charity.totalRaised > 0 && (
                                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                                            {formatINR(charity.totalRaised)} <span className="text-zinc-400 font-medium tracking-normal ml-1">raised</span>
                                        </p>
                                    )}
                                </div>
                                <Link
                                    href={`/charities/${charity.slug}`}
                                    className="inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-bold  bg-zinc-900 dark:bg-zinc-300 dark:text-slate-900 hover:bg-zinc-700 dark:hover:bg-zinc-50 transition-colors"
                                >
                                    Know More
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {charities.length === 0 && (
                <div className="py-32 text-center space-y-4 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem]">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 dark:bg-zinc-900">
                        <Heart className="h-8 w-8 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-bold">No results found</h3>
                    <p className="text-zinc-500">Try adjusting your filters or search terms.</p>
                    <Link href="/charities">
                        <Button variant="ghost">Clear all filters</Button>
                    </Link>
                </div>
            )}

            {/* Bottom CTA */}
            <section className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 px-8 py-16 text-center text-white dark:bg-white dark:text-zinc-900 shadow-2xl">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter">Support a cause while you play</h2>
                    <p className="text-zinc-400 dark:text-zinc-500">
                        Join our community of golfers today. Subscribe to choose a charity and have a portion of your subscription donated monthly.
                    </p>
                    <div className="pt-4">
                        <Link href={'/dashboard/charity'} className="inline-flex h-14 px-10 items-center justify-center rounded-full bg-zinc-50 text-zinc-900 font-bold text-lg hover:bg-zinc-200 dark:hover:bg-zinc-950 dark:bg-zinc-800 dark:text-zinc-50 shadow-xl shadow-black/20 transition-colors">
                            <Button variant="primary" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-black/20 dark:bg-zinc-900 dark:text-white">
                                Get started now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}