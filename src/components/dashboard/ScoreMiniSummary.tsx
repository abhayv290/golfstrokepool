import { ScoreEntry } from "@/actions/scores";
import Link from "next/link";

// components/dashboard/home/ScoreMiniSummary.tsx
export function ScoreMiniSummary({ scores }: { scores: ScoreEntry[] }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Monthly Scores</h3>
                <span className="text-xs font-bold tabular-nums">{scores.length}/5 Slots</span>
            </div>
            <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-10 flex-1 rounded-lg border flex items-center justify-center font-bold tabular-nums ${scores[i]
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50'
                        : 'border-dashed border-zinc-200 text-zinc-300'
                        }`}>
                        {scores[i]?.value ?? '—'}
                    </div>
                ))}
            </div>
            <Link href="/dashboard/scores" className="mt-6 block text-center py-2 rounded-lg border border-zinc-200 text-xs font-bold hover:bg-zinc-900  transition-colors">
                Add New Score
            </Link>
        </div>
    )
}