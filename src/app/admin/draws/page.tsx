import { getSessionUser } from "@/actions/auth"
import { getCurrentDrawAction } from "@/actions/draw"
import DrawPanel from "@/components/admin/DrawPanel"
import { redirect } from "next/navigation"


export const metadata = {
    title: 'Draw Management - Admin Dashboard - GolfStrokePool',
}

export default async function DrawPage() {
    const user = await getSessionUser()
    if (!user || user.role !== 'admin') redirect('/dashboard')

    const res = await getCurrentDrawAction()
    const draw = res.data?.draw ?? null
    const winners = res.data?.winners ?? []

    const now = new Date()
    const monthNm = now.toLocaleString('en-IN', { month: 'long' })
    const year = now.getFullYear()
    return (
        <div className='max-w-4xl mx-auto space-y-6'>
            <div>
                <h1 className="text-2xl font-semibold">
                    Draw Management
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                    {monthNm} {year} draw - {draw?.subscriberCountAtDraw ?? 0} subscribers at last simulation
                </p>
            </div>
            <DrawPanel initialDraw={draw} initialWinners={winners} />

        </div>
    )
}
