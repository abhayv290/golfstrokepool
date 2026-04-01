'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { selectCharityAction } from '@/actions/charity'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { CheckCircle2, ExternalLink, HeartHandshake, Save } from 'lucide-react'
import { Button, LoadingSwap } from '@/components/ui/Button'
import Link from 'next/link'
import { CharityCard } from '@/types/charity'

interface Props {
    charities: CharityCard[]
    currentCharityId: string | null
    currentPercent: number
}

interface CharityFormFields {
    charityId: string
    contributionPercent: number
}

export default function CharitySelector({ charities, currentCharityId, currentPercent }: Props) {
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, watch, formState: { errors } } = useForm<CharityFormFields>({
        defaultValues: {
            charityId: currentCharityId ?? '',
            contributionPercent: currentPercent,
        },
    })

    const selectedId = watch('charityId')
    const selectedCharity = charities.find((c) => c._id.toString() === selectedId)

    const onSubmit = (data: CharityFormFields) => {
        const formData = new FormData()
        formData.set('charityId', data.charityId)
        formData.set('contributionPercent', String(data.contributionPercent))

        startTransition(async () => {
            const res = await selectCharityAction(formData)
            if (res?.error) {
                toast.error(res.message || 'Failed to save charity selection')
                return
            }
            toast.success('Charity selection updated')
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
            {/* Charity Selection Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                        Select Organization
                    </label>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tabular-nums">
                        {charities.length} Available
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {charities.map((charity) => {
                        const isSelected = selectedId === charity._id.toString()
                        return (
                            <label
                                key={charity._id.toString()}
                                className={`relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all
                                    ${isSelected
                                        ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/40 ring-1 ring-zinc-900 dark:ring-zinc-100'
                                        : 'border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    value={charity._id.toString()}
                                    className="sr-only" // Hide native radio
                                    {...register('charityId', { required: 'Please select a charity' })}
                                />

                                <div className="h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50">
                                    {charity.coverImage ? (
                                        <Image
                                            src={charity.coverImage}
                                            alt={charity.name}
                                            width={48}
                                            height={48}
                                            className="object-cover h-full w-full"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-zinc-300">
                                            <HeartHandshake className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 pr-6">
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 truncate">
                                        {charity.name}
                                    </h3>
                                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                                        {charity.category} · {charity.country}
                                    </p>
                                    <p className="text-xs text-zinc-400 line-clamp-1 leading-tight">
                                        {charity.shortDescription}
                                    </p>
                                </div>

                                {isSelected && (
                                    <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-zinc-900 dark:text-zinc-100 animate-in zoom-in-50 duration-200" />
                                )}
                            </label>
                        )
                    })}
                </div>
                {errors.charityId && <p className="text-xs font-bold text-rose-500 uppercase">{errors.charityId.message}</p>}
            </div>

            {/* Contribution Settings */}
            <div className="p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/20 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <label htmlFor="contributionPercent" className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                            Contribution Percentage
                        </label>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Adjust how much of your subscription goes to the charity (min 10%).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="contributionPercent"
                            type="number"
                            className="w-20 h-10 rounded-lg border border-zinc-200 bg-white text-center text-sm font-bold tabular-nums outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-300"
                            {...register('contributionPercent', {
                                required: 'Required',
                                valueAsNumber: true,
                                min: { value: 10, message: 'Min 10%' },
                                max: { value: 100, message: 'Max 100%' },
                                validate: (v) => Number.isInteger(v) || 'Whole numbers only',
                            })}
                        />
                        <span className="text-lg font-bold text-zinc-400">%</span>
                    </div>
                </div>
                {errors.contributionPercent && <p className="text-xs font-bold text-rose-500 uppercase">{errors.contributionPercent.message}</p>}
            </div>

            {/* Preview & Action */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    {selectedCharity ? (
                        <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <div className="text-sm">
                                Supporting <span className="font-bold text-zinc-900 dark:text-zinc-50">{selectedCharity.name}</span>
                                <Link
                                    href={`/charities/${selectedCharity.slug}`}
                                    target="_blank"
                                    className="ml-2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-zinc-400 hover:text-slate-900 dark:hover:text-blue-100 transition-colors"
                                >
                                    Profile <ExternalLink className="size-3" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-zinc-400 italic">No charity selected yet</div>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full md:w-auto min-w-[180px] h-12 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-zinc-200 dark:shadow-none"
                >
                    <LoadingSwap isLoading={isPending}>
                        <Save className="h-4 w-4" /> Save Selection
                    </LoadingSwap>

                </Button>
            </div>
        </form>
    )
}