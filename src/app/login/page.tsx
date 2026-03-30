'use client'
import { LoginAction } from "@/actions/auth"
import { Button, LoadingSwap } from "@/components/ui/Buttom"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FieldValues, useForm } from "react-hook-form"
import toast from "react-hot-toast"

interface LoginFields {
    email: string
    password: string
}
export default function LoginPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LoginFields>()

    const onSubmit = async (data: FieldValues) => {
        const form = new FormData()
        form.set('email', data.email)
        form.set('password', data.password)
        const res = await LoginAction(form)
        if (res?.error) {
            toast.error(res.message)
            return
        }
        toast.success(res.message)
        reset()
        router.push('/')
    }
    return (
        <div className="min-h-screen flex items-center justify-center  bg-background p-4">
            <div className="w-full max-w-md shadow-md shadow-slate-600 p-10">
                <header className="mb-7 text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Create Your Account</h1>
                    <p className="text-sm text-muted-foreground ">Join : Play. Win . Give.</p>
                </header>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
                            Login
                        </LoadingSwap>
                    </Button>
                </form>
                <p className="mt-5 text-center  text-sm  text-muted-foreground">
                    New to Golf-Portal?{' '}
                    <Link href={'/login'} className="font-semibold text-blue-400 hover:text-underline">
                        Sign Up </Link>
                </p>
            </div>
        </div>
    )
}
