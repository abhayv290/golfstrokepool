// components/ui/FileUpload.tsx
import { LucideIcon, Plus } from 'lucide-react'
import { UseFormRegisterReturn } from 'react-hook-form'

interface FileUploadProps {
    label: string
    secondaryLabel?: string
    icon: LucideIcon
    registration: UseFormRegisterReturn
    error?: string
    multiple?: boolean
    accept?: string
    selectedFileName?: string
}

export function FileUpload({
    label,
    secondaryLabel,
    icon: Icon,
    registration,
    error,
    multiple = false,
    accept = "image/*",
    selectedFileName = ''
}: FileUploadProps) {

    return (
        <div className="space-y-2 w-full">
            <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                {label}
            </label>

            <div className="relative group">
                <input
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    {...registration}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`h-32 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 
                    ${error
                        ? 'border-rose-500 bg-rose-50/10'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 group-hover:border-zinc-400 dark:group-hover:border-zinc-600'
                    }`}>

                    <div className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover:scale-110 transition-transform">
                        <Icon className="h-5 w-5 text-zinc-400" />
                    </div>

                    <div className="text-center">
                        <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tighter">
                            {multiple ? 'Upload Files' : 'Select Image'}
                        </span>
                        {secondaryLabel && (
                            <p className="text-[9px] text-zinc-400 uppercase mt-0.5">{secondaryLabel}</p>
                        )}
                        {selectedFileName && (
                            <p className='text-sm text-zinc-200  mt-0.5'>{selectedFileName}</p>
                        )}

                    </div>
                </div>
            </div>

            {error && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                    {error}
                </p>
            )}
        </div>
    )
}