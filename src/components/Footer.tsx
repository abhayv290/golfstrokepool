import Link from 'next/link'
import { Globe, ShieldCheck, CatIcon, Wallet } from 'lucide-react'
import Image from 'next/image'

export default function Footer() {
    const PlatformLinks = [
        { name: 'Dashboard', href: 'dashboard' },
        { name: 'Charities', href: 'charities' },
        { name: 'Draws', href: 'dashboard/draws' },
        { name: 'Scores', href: 'dashboard/scores' },
        { name: 'Admin', href: 'admin' },
    ]

    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full border-t border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-zinc-950 mt-auto">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">

                    {/* Brand & Mission */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <Image src={'/favicon.ico'} alt='golfstrokepool' height={50} width={50} />
                            <span className="text-lg font-black tracking-tighter uppercase text-zinc-900 dark:text-zinc-50">
                                GolfStrokePool
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                            A transparent platform where your Stableford scores drive charitable impact and monthly prize draws.
                        </p>
                    </div>

                    {/* Navigation Groups */}
                    <div className="grid grid-cols-2 col-span-1 md:col-span-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">
                                Platform
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {PlatformLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={`/${item.href}`}
                                        className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors capitalize"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-50">
                                Legal
                            </h4>
                            <nav className="flex flex-col gap-2">
                                {['Privacy', 'Terms', 'Security', 'Compliance'].map((item) => (
                                    <Link
                                        key={item}
                                        href={`/${item.toLowerCase()}`}
                                        className="text-xs font-bold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-500 uppercase tracking-widest tabular-nums flex items-center gap-1">
                            <b className='text-sm dark:text-zinc-50 text-zinc-900'>&copy;</b>  {currentYear} GolfStrokePool
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                            <ShieldCheck className="h-3 w-3" /> Secure by <strong className='dark:text-zinc-100 text-zinc-900 font-bold leading-relaxed text-sm'>RAZORPAY</strong>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase">
                            <Globe className="h-3 w-3" /> Region: INDIA
                        </div>
                        <div className="h-4 w-px bg-zinc-100 dark:bg-zinc-900 hidden md:block" />
                        <Link href="https://github.com/abhayv290" target='_blank' rel='noopener noreferrer' className="text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}