import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('razorpay keys are not defined ')
}

//singleton for hot-reload in dev
declare global {
    var _razorpay: Razorpay | undefined
}

const razorpay: Razorpay = global._razorpay ?? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})


if (process.env.NODE_ENV !== 'production') {
    global._razorpay = razorpay
}
export default razorpay