'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { deleteCharityGalleryImage, uploadCharityMediaAction } from '@/actions/admin' // Your specific media action
import { FileUpload } from '@/components/admin/FileUpload'
import { Button, LoadingSwap } from '@/components/ui/Button'
import { Image as ImageIcon, Plus, Save, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface MediaFields {
    coverImage: FileList
    images: FileList
}

interface Props {
    charityId: string
    currentCover?: string
    currentGallery: string[]
}

export default function CharityMediaForm({ charityId, currentCover, currentGallery }: Props) {
    const [isPending, startTransition] = useTransition()
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<MediaFields>()

    const watchCover = watch('coverImage')
    const watchImages = watch('images')

    const onSubmit = (data: MediaFields) => {
        const formData = new FormData()
        formData.set('charityId', charityId)

        if (data.coverImage?.[0]) formData.append('coverImage', data.coverImage[0])
        if (data.images) {
            console.log('Selected gallery files:', data.images)
            Array.from(data.images).forEach(file => formData.append('images', file))
        }

        startTransition(async () => {
            const res = await uploadCharityMediaAction(formData)
            if (res?.error) {
                toast.error(res.message || "Upload failed")
                return
            }
            toast.success("Media assets updated")
            reset()
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

            {/* 1. Cover Image Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Plus className="h-4 w-4" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Primary Brand Asset</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <FileUpload
                        label="Upload New Cover"
                        secondaryLabel="Recommended: 1200x600px PNG/JPG"
                        icon={Plus}
                        registration={register('coverImage', {
                            validate: (files) => {
                                const file = files?.[0]
                                if (!file) return true
                                if (file.size > 1 * 1024 * 1024) return 'File size should be less than 1MB'
                                return true
                            }
                        })}
                        error={errors.coverImage?.message}
                        selectedFileName={watchCover?.[0]?.name}
                    />

                    {currentCover && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Cover</p>
                            <div className="relative aspect-video rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                                <Image src={currentCover} alt="Cover" width={1080} height={720} className="object-cover" loading='lazy' />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            {/* 2. Gallery Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-zinc-400">
                    <ImageIcon className="h-4 w-4" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Gallery Spotlight</h2>
                </div>

                <div className="space-y-8">
                    <FileUpload
                        label="Add Gallery Items"
                        secondaryLabel="Select up to 5 images"
                        icon={ImageIcon}
                        multiple
                        registration={register('images', {
                            validate: (files) => {
                                if (!files?.length) return true
                                if (files.length > 5) return 'You can upload up to 5 images'
                                for (let i = 0; i < files.length; i++) {
                                    if (files[i].size > 1 * 1024 * 1024) return 'Each file should be less than 1MB'
                                }
                            }
                        })}
                        selectedFileName={watchImages && Array.from(watchImages).map(f => f.name).join(', ')}
                        error={errors.images?.message}
                    />

                    {currentGallery.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Currently Featured ({currentGallery.length}/5)</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {currentGallery.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden group">
                                        <Image
                                            src={img}
                                            fill
                                            sizes="(min-width: 768px) 33vw, 50vw"
                                            alt={`Gallery ${i}`}
                                            className="object-cover"
                                            loading='eager'
                                        />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button onClick={async () => await deleteCharityGalleryImage(charityId, img)} variant="ghost" className="text-white hover:text-rose-500">
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Footer Action */}
            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="min-w-50 h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-zinc-200 dark:shadow-none"
                >
                    <LoadingSwap isLoading={isPending}>
                        <Save className="h-4 w-4 mr-2" /> Sync Media Assets
                    </LoadingSwap>
                </Button>
            </div>
        </form>
    )
}