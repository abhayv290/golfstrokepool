import { getWinnerAction } from '@/actions/admin'
import WinnersClient from './WinnersClient'
import { cookies } from 'next/headers'


export const metadata = {
    title: 'Winners - Admin Dashboard - GolfStrokePool',
}

export default async function AdminWinnersPage() {
    await cookies()
    const result = await getWinnerAction()
    const winners = result.data ?? []

    return <WinnersClient initialWinners={winners} />
}