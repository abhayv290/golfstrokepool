'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createCharityAction, updateCharityAction } from '@/actions/admin'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Save, X, Globe, Tag, Info } from 'lucide-react'

const CATEGORIES = ['health', 'education', 'environment', 'poverty', 'sports', 'community', 'other']

interface CharityFormFields {
    name: string
    slug: string
    description: string
    shortDescription: string
    category: string
    country: string
    website: string
    featured: string
    active: string
}

interface Props {
    mode: 'create' | 'edit'
    charityId?: string
    defaultValues?: Partial<CharityFormFields>
}

export default function CharityForm({ mode, charityId, defaultValues }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CharityFormFields>({
        defaultValues: {
            category: 'other',
            country: 'India',
            featured: 'false',
            active: 'true',
            ...defaultValues,
        },
    })

    const nameValue = watch('name')
    const autoSlug = () => {
        if (mode === 'create' && nameValue) {
            setValue('slug', nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
        }
    }

    const onSubmit = (data: CharityFormFields) => {
        const formData = new FormData()
        Object.entries(data).forEach(([k, v]) => formData.set(k, v))
        if (mode === 'edit' && charityId) formData.set('charityId', charityId)

        startTransition(async () => {
            const result = mode === 'create'
                ? await createCharityAction(formData)
                : await updateCharityAction(formData)
            if (result?.error) {
                toast.error(result.message || 'An error occurred')
                return
            }
            toast.success(mode === 'create' ? 'Charity created' : 'Changes saved')
            router.push('/admin/charities')
        })
    }

    const inputClasses = (hasError: boolean) => `
        w-full h-10 rounded-lg border bg-white px-3 text-sm outline-none transition-all
        dark:bg-zinc-950 dark:text-zinc-200
        ${hasError
            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-900'
            : 'border-zinc-200 focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-300'}
    `

    return (
        <div className="max-w-4xl mx-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
            <header className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">
                    {mode} Charity
                </h1>
                <p className="text-sm text-zinc-500 mt-1">Configure organization details and public presence.</p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8" noValidate>
                {/* Basic Info Group */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                        <Info className="h-4 w-4" />
                        <h2 className="text-xs font-bold uppercase tracking-widest">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Name *</label>
                            <input
                                {...register('name', { required: 'Name is required' })}
                                onBlur={autoSlug}
                                className={inputClasses(!!errors.name)}
                                placeholder="Organization Name"
                            />
                            {errors.name && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Slug *</label>
                            <input
                                {...register('slug', {
                                    required: 'Slug is required',
                                    pattern: { value: /^[a-z0-9-]+$/, message: 'Invalid slug format' },
                                })}
                                readOnly={mode === 'edit'}
                                className={`${inputClasses(!!errors.slug)} ${mode === 'edit' ? 'opacity-60 cursor-not-allowed bg-zinc-50 dark:bg-zinc-900' : ''}`}
                                placeholder="url-friendly-name"
                            />
                            {errors.slug && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.slug.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Short Summary *</label>
                        <input
                            {...register('shortDescription', { required: 'Summary required', maxLength: 160 })}
                            className={inputClasses(!!errors.shortDescription)}
                            placeholder="Briefly describe the charity (max 160 chars)"
                        />
                        <div className="flex justify-between items-center">
                            {errors.shortDescription && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.shortDescription.message}</p>}
                            <span className="text-[10px] text-zinc-400 ml-auto tabular-nums">Max 160 chars</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Full Description *</label>
                        <textarea
                            rows={5}
                            {...register('description', { required: 'Description is required' })}
                            className={`${inputClasses(!!errors.description)} h-auto py-2 leading-relaxed`}
                            placeholder="Tell the full story of the organization..."
                        />
                        {errors.description && <p className="text-[10px] font-bold text-rose-500 uppercase">{errors.description.message}</p>}
                    </div>
                </div>

                <hr className="border-zinc-100 dark:border-zinc-800" />

                {/* Categorization & Metadata */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                        <Tag className="h-4 w-4" />
                        <h2 className="text-xs font-bold uppercase tracking-widest">Categorization & Presence</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Category</label>
                            <select {...register('category')} className={inputClasses(false)}>
                                {CATEGORIES.map((c) => <option key={c} value={c} className="dark:bg-zinc-950">{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Country</label>
                            <input {...register('country')} className={inputClasses(false)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                <input type="url" {...register('website')} placeholder="https://" className={`${inputClasses(false)} pl-9`} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Spotlight Feature</label>
                            <select {...register('featured')} className={inputClasses(false)}>
                                <option value="false" className="dark:bg-zinc-950">Normal Listing</option>
                                <option value="true" className="dark:bg-zinc-950">Featured on Homepage</option>
                            </select>
                        </div>

                        {mode === 'edit' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">System Status</label>
                                <select {...register('active')} className={inputClasses(false)}>
                                    <option value="true" className="dark:bg-zinc-950 text-emerald-600">Active</option>
                                    <option value="false" className="dark:bg-zinc-950 text-rose-600">Inactive / Hidden</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                    <Link
                        href="/admin/charities"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                    >
                        <X className="h-4 w-4" /> Cancel
                    </Link>
                    <Button
                        type="submit"
                        disabled={isPending}
                        variant="primary"
                        className="min-w-[140px] flex items-center justify-center gap-2 shadow-lg shadow-zinc-200 dark:shadow-none"
                    >
                        <Save className="h-4 w-4" />
                        {isPending ? 'Saving...' : mode === 'create' ? 'Create Charity' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    )
}