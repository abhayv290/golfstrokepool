import { PRIZE_TIERS } from "@/app/page";

export function StepCard({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div className="relative p-8 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm shadow-zinc-300 transition-transform hover:-translate-y-1 dark:shadow-zinc-800">
      <span className="text-5xl font-black text-zinc-100 dark:text-zinc-900 absolute top-4 right-6 select-none">
        {step}
      </span>
      <div className="relative z-10 space-y-3">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

// components/home/PrizeTier.tsx
export function PrizeTier({ tier }: { tier: typeof PRIZE_TIERS[0] }) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-950 shadow-sm transition-transform hover:-translate-y-1">
      <div className="p-8 space-y-4">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 font-bold text-lg">
          {tier.pool}
        </div>
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{tier.label}</h3>
          <p className="text-sm text-zinc-500 font-medium">Match {tier.match}</p>
        </div>
      </div>
      <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
          {tier.note}
        </p>
      </div>
    </div>
  );
}