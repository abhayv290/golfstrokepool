'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { uploadWinningProofAction } from '@/actions/winners'  // ← correct import name

import { Button, LoadingSwap } from '@/components/ui/Button'
import { CloudUpload, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { WinnerClient } from '@/types/draw'
import WinnerStatusView from '@/components/dashboard/WinnerStatus'

interface WinnerFormFields {
    proof: FileList
}

interface IWinnerClient extends Omit<WinnerClient, 'userName' | 'userEmail'> {
    drawDate: string
    reviewedAt?: string
    paidAt?: string
    adminNote?: string
}

export default function WinnerProofForm({ winner }: { winner: IWinnerClient }) {
    const [isPending, startTransition] = useTransition()
    const [preview, setPreview] = useState<string | null>(null)
    const [currentStatus, setCurrentStatus] = useState(winner.status)

    const {
        register,
        handleSubmit,
        watch,
        resetField,
        formState: { errors },
    } = useForm<WinnerFormFields>()

    const proofFile = watch('proof')

    useEffect(() => {
        if (proofFile?.[0]) {
            const url = URL.createObjectURL(proofFile[0])
            setPreview(url)
            return () => URL.revokeObjectURL(url)
        }
        setPreview(null)
    }, [proofFile])

    const onSubmit = (data: WinnerFormFields) => {
        const formData = new FormData()
        formData.set('winnerId', winner._id)
        formData.set('proof', data.proof[0])

        startTransition(async () => {
            const res = await uploadWinningProofAction(formData)

            if (res.error) {
                toast.error(res.message || 'Submission failed')
                return
            }

            toast.success('Submitted for review')
            setCurrentStatus('proof_submitted')
        })
    }

    // Show status view for any status other than pending
    if (currentStatus !== 'pending') {
        return (
            <WinnerStatusView
                status={currentStatus}
                adminNote={winner.adminNote ?? ''}
                reviewedAt={winner.reviewedAt ?? ''}
                paidAt={winner.paidAt ?? ''}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
            <div className="rounded-[2.5rem] border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 p-8 lg:p-12 space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                        Scorecard Proof
                    </h2>
                    <p className="text-xs text-zinc-500 font-medium">
                        Upload a clear screenshot of your winning scores.
                    </p>
                </div>

                {!preview ? (
                    <label className="group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-4xl bg-zinc-50/30 hover:bg-zinc-500/50 transition-all cursor-pointer">
                        <CloudUpload className="h-10 w-10 text-zinc-300 group-hover:text-zinc-900" />
                        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            Select Image (Max 5MB)
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            {...register('proof', { required: 'Proof image is required' })}
                        />
                    </label>
                ) : (
                    <div className="relative rounded-4xl border border-zinc-900 dark:border-zinc-100 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                        <div className="relative aspect-video w-full">
                            <Image src={preview} alt="Proof preview" fill className="object-contain p-6" />
                        </div>
                        <button
                            type="button"
                            onClick={() => resetField('proof')}
                            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-2xl cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Show RHF error if submitted without selecting a file */}
                {errors.proof && (
                    <p className="text-xs text-red-500 text-center">{errors.proof.message}</p>
                )}

                <Button
                    type="submit"
                    disabled={isPending || !proofFile?.[0]}
                    variant="primary"
                    className="w-full h-10 font-black uppercase tracking-[0.2em] text-sm"
                >
                    <LoadingSwap isLoading={isPending}>Verify and Submit</LoadingSwap>
                </Button>
            </div>
        </form>
    )
}