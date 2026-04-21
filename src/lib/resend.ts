import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not define at .env')
}

//Creating Client
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? 'golfstrokepool@resend.abhayvii.dev'


/** Send OTP Email */

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your password reset code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 8px">Password reset</h2>
        <p style="color:#666;margin:0 0 24px">
          Enter this code on the password reset page. It expires in 10 minutes.
        </p>
        <div style="font-size:40px;font-weight:700;letter-spacing:12px;text-align:center;
                    background:#f4f4f5;border-radius:12px;padding:24px;margin-bottom:24px">
          ${otp}
        </div>
        <p style="color:#999;font-size:13px;margin:0">
          If you didn't request this, ignore this email. Your password won't change.
        </p>
      </div>
    `,
  })
}


// ─── Send password changed confirmation ───────────────────────────────────────

export async function sendPasswordChangedEmail(email: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your password has been changed',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 8px">Password changed</h2>
        <p style="color:#666;margin:0 0 24px">
          Your Golf Platform password was successfully changed.
        </p>
        <p style="color:#666;margin:0 0 24px">
          If you didn't make this change, contact support immediately.
        </p>
      </div>
    `,
  })
}
