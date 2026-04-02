import { getSessionUser } from "@/actions/auth";
import CheckoutClient from "@/components/dashboard/CheckoutClient";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Subscribe - Dashboard - GolfStrokePool',
    description: 'Subscribe to GolfStrokePool to enter monthly draws, track your Stableford scores, and support your chosen charity. Choose a plan that fits your game and start making an impact today.',
    keywords: ['subscribe', 'subscription plans', 'monthly draws', 'Stableford tracking', 'charity support', 'golf rewards', 'dashboard']
}

export default async function SubscribePage() {
    const user = await getSessionUser()
    if (!user) {
        redirect('/login')
    }
    //Already Subscribed 
    if (user.subscriptionStatus === 'active') {
        redirect('/dashboard')
    }
    return (
        <div className='min-h-screen bg-background flex items-start justify-center px-4 py-16'>
            <div className="w-full max-w-4xl">
                {/* Header  */}
                <header className='text-center mb-12'>
                    <h1 className='text-4xl font-bold  tracking-tight'>
                        Choose Your Plan
                    </h1>
                    <p className='mt-3 text-muted-foreground  text-base  max-w-md mx-auto'>
                        Subscribe to Enter monthly draws , track your score , and support the charity of your choice
                    </p>
                </header>

                {/* Plan Card , Checkout  */}
                <CheckoutClient userName={user.name} userEmail={user.email} />

                {/* Trust Signals  */}
                <div className='mt-10 flex flex-wrap justify-center items-center gap-5 text-sm text-muted-foreground'>
                    {[
                        'Cancel Anytime',
                        'Secure Payments via Razorpay',
                        'Min . 10% goes to your  chosen charity',
                        'Monthly prize draws'
                    ].map((item, idx) => (
                        <div key={idx} className='flex items-center gap-1.5'>
                            <span className='text-green-400 font-semibold'>
                                {item}
                            </span>
                        </div>
                    ))}

                </div>
            </div>

        </div>
    )
}
