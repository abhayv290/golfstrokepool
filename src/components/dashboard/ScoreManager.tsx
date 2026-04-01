'use client'

import { addScoreAction, deleteScoreAction, editScoreAction, ScoreEntry } from "@/actions/scores"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Button, LoadingSwap } from "../ui/Button"

interface FormFields {
    value: number
    datePlayed: string
}
const MAX_SCORES = 5
export default function ScoreManager({ initialScores }: { initialScores: ScoreEntry[] }) {
    const [scores, setScores] = useState(initialScores)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    //today's date 
    const todayStr = new Date().toISOString().split('T')[0]

    const { register, setValue, handleSubmit, formState: { errors } } = useForm<FormFields>({ mode: 'onTouched' })

    //ADD 
    const onAdd = (data: FormFields) => {
        const form = new FormData()
        form.set('value', String(data.value))
        form.set('datePlayed', data.datePlayed)

        startTransition(async () => {
            const res = await addScoreAction(form)
            if (res?.error) {
                toast.error(res.message)
                return
            }
            toast.success(res.message ?? 'New Score Added')
            setScores(res.data ?? [])
            setValue('value', Number(undefined))
            setValue('datePlayed', '')
        })
    }


    //EDIT  (Populate form)
    const startEdit = (score: ScoreEntry) => {
        setEditingId(score._id)
        setValue('value', Number(score.value))
        setValue('datePlayed', score.datePlayed.split('T')[0])
    }

    const onEdit = (data: FormFields) => {
        if (!editingId) return
        const form = new FormData()
        form.set('scoreId', editingId)
        form.set('value', String(data.value))
        form.set('datePlaned', data.datePlayed)

        startTransition(async () => {
            const res = await editScoreAction(form)
            if (res.error) {
                toast.error(res.message)
                return
            }
            toast.success(res.message)
            setScores(res.data ?? [])
            setEditingId(null)
            setValue('value', Number(undefined))
            setValue('datePlayed', '')
        })
    }

    //DELETE 
    const onDelete = (scoreId: string) => {
        if (!scoreId) return
        startTransition(async () => {
            const res = await deleteScoreAction(scoreId)
            if (res.error) {
                toast.error(res.message)
                return
            }
            toast.success(res.message)
            setScores(res.data ?? [])
            if (editingId === scoreId) {
                setEditingId(null)
                setValue('value', Number(undefined))
                setValue('datePlayed', '')
            }
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setValue('value', Number(undefined))
        setValue('datePlayed', '')
    }
    const isEditing = !!editingId
    const canAddMore = scores.length < MAX_SCORES

    return (
        <div className="space y-6">
            {/* Score Slots */}
            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800">
                <div className="flex justify-between items-center">
                    <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase">RECENT PERFORMANCES</h2>
                    <div className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-800 text-slate-300 border border-zinc-700/50">
                        {scores.length}<span className="text-zinc-500 mx-0.5">/</span>{MAX_SCORES}
                    </div>
                </div>
                {scores.length == 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-800/20 group transition-all">
                        <div className="p-4 rounded-full bg-zinc-800/50 mb-3 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl filter grayscale opacity-60">🎯</span>
                        </div>
                        <h3 className="text-sm font-medium text-slate-400">No Score Recorded</h3>
                        <p className="text-xs text-zinc-500 mt-1">Complete a session to see your stats here.</p>
                    </div>
                )}
                <div className="grid gap-2">
                    {scores.map((score, index) => {
                        const isOldest = scores.length - 1 === index && scores.length === MAX_SCORES
                        const isBeingEdited = editingId === score._id
                        return (
                            <div key={index} className={`flex items-center justify-between rounded-xl px-4 py-3 transition-colors ${isBeingEdited ? 'bg-inherit/20' : 'bg-inherit/50'}`}>
                                {/* Score INfo  */}
                                <div className="flex items-center gap-10">
                                    {/* Slot Info */}
                                    <span className="w-7  text-center text-sm  text-slate-500">
                                        {index + 1}.
                                    </span>

                                    <span className="px-3 py-1 bg-zinc-500/20 text-slate-300 font-bold text-xl rounded-xl" > {score.value}</span>

                                    {/* Date  */}
                                    <div className="text-sm">
                                        <span>
                                            {new Date(score.datePlayed).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        {isOldest && (
                                            <span className="text-xs text-amber-500">
                                                Oldest-replace on next entry
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Action Buttons  */}
                                <div className="flex items-center gap-5">
                                    <Button type="button" variant="secondary" onClick={() => isBeingEdited ? cancelEdit() : startEdit(score)}
                                        className="w-24">
                                        {isBeingEdited ? 'Cancel' : 'Edit'}
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => onDelete(score._id)} disabled={isPending} className="w-24 hover:bg-red-500/70" >
                                        <LoadingSwap isLoading={isPending && !isEditing}>
                                            Delete
                                        </LoadingSwap>
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            {/* Capacity Progress Bar */}
            <div className='flex items-center gap-2 w-full my-3'>
                {Array.from({ length: MAX_SCORES }).map((_, i) => (
                    <div key={i} className={`h-1 rounded-md  w-full ${scores.length > i ? 'bg-slate-300' : 'bg-zinc-600'}`}></div>
                ))}
            </div>
            <div className="flex flex-col gap-6 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 shadow-xl backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-100">
                        {isEditing ? 'Edit Score' : canAddMore ? 'Add a Score' : 'Replace Oldest One'}
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                        {isEditing ? 'Modify your performance data' : 'Log a new round'}
                    </p>
                </div>

                <form onSubmit={handleSubmit(isEditing ? onEdit : onAdd)} noValidate className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Score Value */}
                        <div className="space-y-1.5">
                            <label htmlFor="value" className="text-xs font-semibold text-slate-400 ml-1">
                                Stableford Score
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="value"
                                    placeholder="eg. 20"
                                    aria-invalid={!!errors.value}
                                    {...register('value', {
                                        required: 'Score Value is Required',
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Minimum score is 1' },
                                        max: { value: 45, message: 'Cannot Exceed 45' },
                                        validate: (v) => Number.isInteger(v) || 'Score must be whole number'
                                    })}
                                    className="w-full rounded-xl px-4 py-2.5 bg-zinc-950/50 border border-zinc-700 text-slate-200 placeholder:text-zinc-600 transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none aria-invalid:border-rose-500/50 aria-invalid:focus:ring-rose-500/10"
                                />
                            </div>
                            {errors.value && (
                                <p className="text-[11px] font-medium text-rose-400 ml-1 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-rose-400" /> {errors.value.message}
                                </p>
                            )}
                        </div>

                        {/* Date Played */}
                        <div className="space-y-1.5">
                            <label htmlFor="datePlayed" className="text-xs font-semibold text-slate-400 ml-1">
                                Date Played
                            </label>
                            <input
                                type="date"
                                id="datePlayed"
                                aria-invalid={!!errors.datePlayed}
                                max={todayStr}
                                {...register('datePlayed', {
                                    required: 'Date Played is required',
                                    validate: (v) => new Date(v) <= new Date() || 'Cannot be in future'
                                })}
                                className="w-full rounded-xl px-4 py-2.5 bg-zinc-950/50 border border-zinc-700 text-slate-200 transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none aria-invalid:border-rose-500/50 aria-invalid:focus:ring-rose-500/10 scheme-dark"
                            />
                            {errors.datePlayed && (
                                <p className="text-[11px] font-medium text-rose-400 ml-1 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-rose-400" /> {errors.datePlayed.message}
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Form Actions */}
                    <div className="flex items-center justify-center gap-3 pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-1/4"
                            disabled={isPending}
                        >
                            <LoadingSwap isLoading={isPending}>
                                {isEditing ? 'Save Changes' : 'Add Score'}
                            </LoadingSwap>
                        </Button>

                        {isEditing && (
                            <Button
                                type="button"
                                disabled={isPending}
                                variant="secondary"
                                onClick={cancelEdit}
                                className="w-28"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
