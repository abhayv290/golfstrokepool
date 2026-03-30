'use client'

import { registerAction } from "@/actions/auth";
import { Button, LoadingSwap } from "@/components/ui/Buttom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface RegisterFields {
    name: string;
    email: string;
    password: string;
}

export default function RegisterPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, formState: { errors }, reset } = useForm<RegisterFields>({ 'mode': 'onTouched' })

    const onSubmit = async (data: RegisterFields) => {
        const formdata = new FormData()
        formdata.set('name', data.name)
        formdata.set('email', data.email)
        formdata.set('password', data.password)

        startTransition(async () => {
            const res = await registerAction(formdata)
            if (res?.error) {
                toast.error(res.message)
                return
            }
            reset()
            router.push('/dashboard/subscribe')
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center  bg-background p-4">
            <div className="w-full max-w-md shadow-md shadow-slate-600 p-10">
                <header className="mb-7 text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
                    <p className="text-sm text-muted-foreground ">Join : Play. Win . Give.</p>
                </header>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                            Full name
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Abhay Vi"
                            aria-invalid={!!errors.name}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-50 aria-invalid:border-destructive"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                                maxLength: { value: 80, message: 'Name is too long' },
                            })}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                        )}
                    </div>
                    {/* Email */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            placeholder="abhay@gmail.com"
                            aria-invalid={!!errors.email}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-50 aria-invalid:border-destructive"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password  */}
                    <div>
                        <label htmlFor="password">Password</label>
                        <input type="text" id="password" autoComplete="new-password"
                            placeholder="min 6 chars"
                            aria-invalid={!!errors.password}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'minimum 6 char required' }
                            })}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2  text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring disabled:opacity-50 aria-invalid:border-destructive" />
                        {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
                        }
                    </div>
                    <Button disabled={isPending} type="submit" variant="primary" >
                        <LoadingSwap isLoading={isPending}>
                            Create Account
                        </LoadingSwap>
                    </Button>
                </form>
                <p className="mt-5 text-center  text-sm  text-muted-foreground">
                    Already Have an Account?{' '}
                    <Link href={'/login'} className="font-medium text-primary hover:text-blue-400 hover:text-underline">
                        Sign in </Link>
                </p>
            </div>
        </div>
    )
}
