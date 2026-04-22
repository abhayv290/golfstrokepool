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

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Welcome to GolfStrokePool',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 8px">Welcome, ${name}</h2>
        <p style="color:#666;margin:0 0 24px">
          Your account is set up. Here's what to do next:
        </p>
        <ol style="color:#666;padding-left:20px;margin:0 0 24px">
          <li style="margin-bottom:8px">Choose a subscription plan</li>
          <li style="margin-bottom:8px">Enter your Stableford golf scores</li>
          <li style="margin-bottom:8px">Pick a charity to support</li>
          <li>You're automatically entered into the monthly draw</li>
        </ol>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscribe"
           style="display:inline-block;background:#18181b;color:#fff;
                  padding:12px 24px;border-radius:8px;text-decoration:none;
                  font-weight:600">
          Get started
        </a>
        <p style="color:#999;font-size:13px;margin:24px 0 0">
          Questions? 
          Email us at <a href="mailto:abhayv290@gmail.com">abhayv290@gmail.com</a>.
        </p>
      </div>
    `,
  })
}

type NewLoginEmailDetails = {
  ipAddress?: string
  userAgent?: string
  loggedInAt?: Date
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export async function sendNewLoginEmail(
  email: string,
  details: NewLoginEmailDetails = {},
): Promise<void> {
  const loggedInAt = details.loggedInAt ?? new Date()
  const ipAddress = details.ipAddress ? escapeHtml(details.ipAddress) : 'Unavailable'
  const userAgent = details.userAgent ? escapeHtml(details.userAgent) : 'Unavailable'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'New login detected',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 8px">New login to your account</h2>
        <p style="color:#666;margin:0 0 20px">
          We noticed a new login to your Golf Stroke Pool account.
        </p>

        <div style="background:#f4f4f5;border-radius:12px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px"><strong>Time:</strong> ${loggedInAt.toUTCString()}</p>
          <p style="margin:0 0 8px"><strong>IP:</strong> ${ipAddress}</p>
          <p style="margin:0"><strong>Device:</strong> ${userAgent}</p>
        </div>

        <p style="color:#666;margin:0">
          If this was not you.reset your password immediately.
        </p>
      </div>
    `,
  })
}


export async function sendDrawBroadcastEmail(
  recipients: { email: string; name: string }[],
  drawnNumbers: number[],
  month: string,
  year: number
): Promise<void> {
  const BATCH_SIZE = 50
  const batches = []

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    batches.push(recipients.slice(i, i + BATCH_SIZE))
  }

  for (const batch of batches) {
    await resend.batch.send(
      batch.map((r) => ({
        from: FROM,
        to: r.email,
        subject: `${month} ${year} draw results are in`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="margin:0 0 8px">${month} ${year} draw</h2>
            <p style="color:#666;margin:0 0 24px">
              Hi ${r.name}, the monthly draw numbers have been published.
            </p>
            <p style="color:#666;margin:0 0 8px">This month's numbers:</p>
            <div style="display:flex;gap:12px;margin-bottom:24px">
              ${drawnNumbers
            .map(
              (n) => `
                <span style="display:inline-flex;align-items:center;justify-content:center;
                             width:48px;height:48px;border-radius:10px;
                             background:#f4f4f5;font-size:22px;font-weight:700">
                  ${n}
                </span>`
            )
            .join('')}
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/draws"
               style="display:inline-block;background:#18181b;color:#fff;
                      padding:12px 24px;border-radius:8px;
                      text-decoration:none;font-weight:600">
              See if you won
            </a>
          </div>
        `,
      }))
    )
  }
}