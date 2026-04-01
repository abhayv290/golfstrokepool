import { getUserDetailsAction } from "@/actions/admin"
import UserEditClient from "@/components/admin/UserClient"
import { notFound, redirect } from "next/navigation"


export default async function AdminUserDetailPage({ params }: {
    params: Promise<{ userId: string }>
}) {
    const { userId } = await params
    if (!userId) notFound()
    const res = await getUserDetailsAction(userId)
    if (res?.error || !res.data) {
        redirect('/admin/users') // Redirect back to users list if user not found or error occurs
    }
    return (
        <UserEditClient user={res.data} />
    )
}
