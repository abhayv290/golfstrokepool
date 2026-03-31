'use client'
import { LogOutIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/Button'
import { LogoutAction } from '@/actions/auth'
import { AuthUser } from '@/types/auth'

interface NavItem {
    label: string
    url: string
}
export default function Navbar({ user }: { user: AuthUser | null }) {
    const navItem: NavItem[] = [
        { label: 'Home', url: '/' },
        { label: 'Scores', url: '/dashboard/scores' },
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'admin', url: '/admin' }
    ]

    return (
        <div className='h-20 z-10 w-full shadow-sm shadow-slate-700 mb-5'>
            <nav className='mx-auto h-full px-3 flex items-center justify-between'>
                {/* Brand Logo and Title  */}
                <div className='flex h-full items-center gap-2'>
                    <Image width={50} height={50} src={'/favicon.ico'} alt='logo' />
                    <h2 className='font-bold text-2xl font-accent'>Golf Portal</h2>
                </div>
                {/* Pages  */}
                <div className='flex gap-4'>
                    {
                        navItem.map((nav, idx) => (
                            <Link key={idx} href={nav.url}
                                className='text-lg font-semibold '>{nav.label}</Link>
                        ))
                    }
                </div>
                {user ? (<div className='flex gap-4 justify-self-end items-center'>
                    {/* My Profile */}
                    <h2 className='text-muted-foreground font-medium'>{user.name}</h2>
                    <Button type='button' variant={'ghost'} onClick={() => LogoutAction()} title='Logout'>
                        <LogOutIcon />
                    </Button>
                </div>) : (
                    <Button variant='primary'>
                        <Link href={'/login'}>Sign in</Link>
                    </Button>
                )}
            </nav>
        </div>
    )
}
