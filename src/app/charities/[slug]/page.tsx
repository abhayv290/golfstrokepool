import { notFound } from 'next/navigation'
import { getCharityBySlugAction } from '@/actions/charity'
import { formatINR } from '@/lib/drawEngine'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Globe, MapPin, Heart, Calendar, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default async function CharityProfilePage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const res = await getCharityBySlugAction(slug)
    if (res.error || !res.data) notFound()

    const charity = res.data

    return (
        <div className="max-w-6xl mx-auto px-6 py-5 space-y-16">
            {/* Breadcrumb */}
            <Link
                href="/charities"
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors group"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to all charities
            </Link>

            {/* Hero Section */}
            <section className="space-y-8">
                {charity.coverImage && (
                    <div className="relative aspect-21/9 w-full overflow-hidden rounded-4xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <Image
                            src={charity.coverImage}
                            alt={charity.name}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent md:hidden" />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left: Main Header Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            {charity.featured && (
                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-200/50 dark:border-amber-500/20">
                                    ★ Featured Spotlight
                                </span>
                            )}
                            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                                {charity.category}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase">
                                <MapPin className="h-3.5 w-3.5" /> {charity.country}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                            {charity.name}
                        </h1>
                        <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                            {charity.shortDescription}
                        </p>
                    </div>

                    {/* Right: Stats & Quick Actions */}
                    <div className="space-y-6">
                        {charity.totalRaised > 0 && (
                            <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm space-y-2">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Raised through Golf Portal</p>
                                <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                                    {formatINR(charity.totalRaised)}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <Button variant="primary" className="h-14 rounded-xl text-lg font-bold w-full" >
                                <Link href="/dashboard/charity">Support this charity</Link>
                            </Button>
                            {charity.website && (
                                <a
                                    href={charity.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
                                >
                                    <Globe className="h-4 w-4" /> Visit official website <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <section className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Heart className="h-5 w-5 text-rose-500" /> About the organization
                    </h2>
                    <div className="space-y-4 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                        {charity.description.split('\n').filter(p => p.trim() !== '').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>
                </section>

                {/* Sidebar Details / Gallery Teaser */}
                <aside className="space-y-10">
                    {charity.images.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Impact Gallery</h2>
                            <div className="grid grid-cols-2 gap-2">
                                {charity.images.slice(0, 4).map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                        <Image src={url} alt={`${charity.name} ${i}`} fill className="object-cover transition-transform hover:scale-110 cursor-zoom-in" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Upcoming Events */}
            {charity.events?.length > 0 && (
                <section className="space-y-8 p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-zinc-400" />
                        <h2 className="text-2xl font-bold tracking-tight">Upcoming Golf Events</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {charity.events
                            .filter((e) => new Date(e.date) >= new Date())
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((event, i) => (
                                <article key={i} className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{event.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-500 uppercase tracking-tight">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
                                        </div>
                                        {event.description && <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">{event.description}</p>}
                                    </div>
                                </article>
                            ))}
                    </div>
                </section>
            )}

            {/* Subscribe CTA */}
            <section className="relative overflow-hidden rounded-[2.5rem]  shadow-zinc-300 px-8 py-16 text-center text-white  dark:text-zinc-100 shadow-sm">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
                        Play golf. Support {charity.name}.
                    </h2>
                    <p className="text-zinc-400 dark:text-zinc-500 text-lg leading-relaxed">
                        A minimum of 10% of your monthly subscription goes directly to {charity.name}.
                        Keep your scores sharp, and your impact sharper.
                    </p>
                    <div className="pt-4">
                        <Link href="/dashboard/charity">
                            <Button variant="primary" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-black/20 dark:bg-zinc-200 dark:text-zinc-900">
                                Subscribe and support
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}