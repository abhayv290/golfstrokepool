'use client'

import { useState } from 'react'
import { LogOutIcon, Menu, X, UserCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/Button'
import { LogoutAction } from '@/actions/auth'
import { AuthUser } from '@/types/auth'
import { usePathname } from 'next/navigation'

export default function Navbar({ user }: { user: AuthUser | null }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()

    const adminItems = [
        { label: 'Overview', url: '/admin' },
        { label: 'Draws', url: '/admin/draws' },
        { label: 'Winners', url: '/admin/winners' },
        { label: 'Users', url: '/admin/users' },
        { label: 'Charities', url: '/admin/charities' }
    ]

    const userItems = [
        { label: 'Home', url: '/dashboard' },
        { label: 'Scores', url: '/dashboard/scores' },
        { label: 'Draws', url: '/dashboard/draws' },
        { label: 'Charity', url: '/dashboard/charity' },
    ]
    const guestUserItem = [
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'Charities', url: '/charities' }
    ]

    // Select items based on role (default to userItems if not logged in or not admin)
    let items = guestUserItem
    if (user && user.role === 'admin' && pathname.startsWith('/admin')) {
        items = adminItems
    } else if (user) {
        items = userItems
    }

    return (
        <div className='sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95 mb-6'>
            <nav className='mx-auto max-w-7xl h-16 px-4 flex items-center justify-between'>

                {/* Brand Logo and Title */}
                <div className='flex items-center gap-8'>
                    <Link href="/" className='flex items-center gap-2'>
                        <Image width={32} height={32} src={'/favicon.ico'} alt='logo' className="rounded-md" />
                        <h2 className='font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50 font-accent'>
                            Golf Pool
                        </h2>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className='hidden md:flex items-center gap-6'>
                        {items.map((nav, idx) => (
                            <Link
                                key={idx}
                                href={nav.url}
                                className={`text-sm font-semibold transition-colors hover:text-zinc-900 dark:hover:text-zinc-50 
                                    ${pathname === nav.url
                                        ? 'text-zinc-900 dark:text-zinc-50'
                                        : 'text-zinc-500 dark:text-zinc-400'
                                    }`}
                            >
                                {nav.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className='flex items-center gap-4'>
                    {user ? (
                        <div className='flex items-center gap-4'>
                            {/* User Info (Desktop only) */}
                            <div className='hidden md:flex flex-col items-end'>
                                <span className='text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-none'>{user.name}</span>
                                <span className='text-[10px] uppercase text-zinc-500 mt-1'>{
                                    user.role === 'admin' ? 'admin' : (user.subscriptionStatus === 'active' ? 'subscriber' : 'non-subscriber')}</span>
                            </div>

                            <Button
                                type='button'
                                variant={'ghost'}
                                onClick={() => LogoutAction()}
                                title='Logout'
                                className="p-2 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400"
                            >
                                <LogOutIcon className="h-5 w-5" />
                            </Button>

                            {/* Mobile Hamburger Toggle */}
                            <button
                                className="md:hidden p-2 text-zinc-900 dark:text-zinc-50"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant='primary'>
                                <Link href={'/login'}>Sign in</Link>
                            </Button>
                            <button
                                className="md:hidden p-2 text-zinc-900 dark:text-zinc-50"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-6 space-y-6 animate-in slide-in-from-top-2">
                    <div className="flex flex-col gap-4">
                        {items.map((nav, idx) => (
                            <Link
                                key={idx}
                                href={nav.url}
                                onClick={() => setIsMenuOpen(false)}
                                className={`text-lg font-bold ${pathname === nav.url ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-500'}`}
                            >
                                {nav.label}
                            </Link>
                        ))}
                    </div>

                    {user && (
                        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                            <UserCircle className="h-10 w-10 text-zinc-300" />
                            <div>
                                <p className="font-bold text-zinc-900 dark:text-zinc-50">{user.name}</p>
                                <p className="text-xs text-zinc-500 uppercase">{user.role}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}