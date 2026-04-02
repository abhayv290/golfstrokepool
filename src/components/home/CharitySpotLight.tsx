// components/home/CharitySpotlight.tsx
import Image from 'next/image';
import Link from 'next/link';
import { formatINR } from '@/lib/drawEngine';
import { ICharity } from '@/models/Charity';

export function CharitySpotlight({ charity }: { charity: ICharity }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950 shadow-xl">
            <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                {charity.coverImage && (
                    <Image
                        src={charity.coverImage}
                        alt={charity.name}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                    />
                )}
            </div>
            <div className="space-y-6">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider dark:bg-rose-500/10 dark:text-rose-400">
                    {charity.category}
                </span>
                <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{charity.name}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{charity.shortDescription}</p>

                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 uppercase font-bold">Total Raised</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                        {formatINR(charity.totalRaised)}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                    <Link href={`/charities/${charity.slug}`} className="px-6 py-3 rounded-xl bg-zinc-900 text-zinc-50 font-bold hover:bg-zinc-800 transition-colors dark:bg-zinc-50 dark:text-zinc-900">
                        Learn more
                    </Link>
                    {charity.website && (
                        <a href={charity.website} target="_blank" className="px-6 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:border-zinc-900 dark:border-zinc-800 dark:text-zinc-400">
                            Official Site
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}