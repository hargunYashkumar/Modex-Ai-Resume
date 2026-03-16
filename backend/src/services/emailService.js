/**
 * emailService.js
 *
 * Sends transactional emails.  Currently logs to console in development;
 * swap in AWS SES (or SendGrid) for production by filling the env vars.
 *
 * Required env vars (production):
 *   EMAIL_PROVIDER   = ses | sendgrid
 *   EMAIL_FROM       = noreply@yourdomain.com
 *   AWS_SES_REGION   = ap-south-1          (if provider = ses)
 *   SENDGRID_API_KEY = SG.xxx              (if provider = sendgrid)
 */
const logger = require('../utils/logger')

const FROM    = process.env.EMAIL_FROM    || 'noreply@resumeai.app'
const PROVIDER = process.env.EMAIL_PROVIDER || 'log'

async function sendEmail({ to, subject, html, text }) {
  if (PROVIDER === 'log' || process.env.NODE_ENV === 'test') {
    logger.info(`[EMAIL] To: ${to} | Subject: ${subject}`)
    logger.debug(`[EMAIL] Body: ${text || html}`)
    return { messageId: 'dev-' + Date.now() }
  }

  if (PROVIDER === 'ses') {
    const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')
    const ses = new SESClient({ region: process.env.AWS_SES_REGION || 'ap-south-1' })
    const res = await ses.send(new SendEmailCommand({
      Source: FROM,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: html ? { Data: html }  : undefined,
          Text: text ? { Data: text }  : undefined,
        },
      },
    }))
    return { messageId: res.MessageId }
  }

  if (PROVIDER === 'sendgrid') {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const [res] = await sgMail.send({ to, from: FROM, subject, html, text })
    return { messageId: res.headers['x-message-id'] }
  }

  throw new Error(`Unknown EMAIL_PROVIDER: ${PROVIDER}`)
}

// ── Template helpers ──────────────────────────────────────────────────────

async function sendPasswordReset(to, resetUrl) {
  return sendEmail({
    to,
    subject: 'Reset your ResumeAI password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1C2540;font-size:22px;margin-bottom:8px">Reset your password</h2>
        <p style="color:#3E4A6A;font-size:14px;line-height:1.6">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:24px 0;padding:12px 24px;background:#1C2540;color:#fff;text-decoration:none;border-radius:4px;font-size:14px;font-weight:500">
          Reset password
        </a>
        <p style="color:#9EA5B8;font-size:12px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Reset your ResumeAI password: ${resetUrl}\n\nThis link expires in 1 hour.`,
  })
}

async function sendWelcome(to, name) {
  return sendEmail({
    to,
    subject: `Welcome to ResumeAI, ${name}!`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#1C2540;font-size:22px;margin-bottom:8px">Welcome, ${name}!</h2>
        <p style="color:#3E4A6A;font-size:14px;line-height:1.6">
          Your account is ready. Start building your AI-powered resume today.
        </p>
        <a href="${process.env.FRONTEND_URL}/resumes/new"
           style="display:inline-block;margin:24px 0;padding:12px 24px;background:#C9A84C;color:#1C2540;text-decoration:none;border-radius:4px;font-size:14px;font-weight:500">
          Build your first resume
        </a>
      </div>
    `,
    text: `Welcome to ResumeAI, ${name}! Get started: ${process.env.FRONTEND_URL}/resumes/new`,
  })
}

module.exports = { sendEmail, sendPasswordReset, sendWelcome }
