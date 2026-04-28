import { Resend } from 'resend'

import { SITE_CONFIG } from '@/consts'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key?.startsWith('re_')) return null
  return new Resend(key)
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || process.env.ADMIN_NOTIFICATION_EMAIL || 'onboarding@resend.dev'
}

export async function sendContactNotifications(input: {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
}): Promise<{ userSent: boolean; adminSent: boolean }> {
  const resend = getResend()
  const from = fromAddress()
  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || SITE_CONFIG.contact.email

  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing — skipping Resend')
    return { userSent: false, adminSent: false }
  }

  const subjLabel = input.subject.replace(/</g, '')

  const [userResult, adminResult] = await Promise.all([
    resend.emails.send({
      from: `Meno Dive Club <${from}>`,
      to: input.email,
      replyTo: adminTo,
      subject: 'We got your message — Meno Dive Club',
      html: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>Thanks for contacting Meno Dive Club. We’ve received your message about <strong>${escapeHtml(subjLabel)}</strong> and usually reply within 24 hours.</p>
        <p>For quicker answers during the day, WhatsApp us at ${escapeHtml(SITE_CONFIG.contact.phone)}.</p>
        <p>— The team at Meno Dive Club<br>Gili Meno, Indonesia</p>
      `,
    }),
    resend.emails.send({
      from: `Site forms <${from}>`,
      to: adminTo,
      replyTo: input.email,
      subject: `[Contact] ${subjLabel} — ${input.name}`,
      html: `
        <h2>New contact form</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}<br/>
        <strong>Email:</strong> ${escapeHtml(input.email)}<br/>
        ${input.phone ? `<strong>Phone:</strong> ${escapeHtml(input.phone)}<br/>` : ''}
        <strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(input.message).replace(/\n/g, '<br/>')}</p>
      `,
    }),
  ])

  if (userResult.error) console.error('[email] user notify', userResult.error)
  if (adminResult.error) console.error('[email] admin notify', adminResult.error)

  return {
    userSent: !userResult.error,
    adminSent: !adminResult.error,
  }
}

export async function sendBookingNotifications(input: {
  name: string
  email: string
  phone?: string | null
  divers: number
  course: string
  preferredDate: string
  certification?: string | null
  notes?: string | null
}): Promise<{ userSent: boolean; adminSent: boolean }> {
  const resend = getResend()
  const from = fromAddress()
  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || SITE_CONFIG.contact.email

  if (!resend) {
    console.warn('[email] RESEND_API_KEY missing — skipping Resend')
    return { userSent: false, adminSent: false }
  }

  const courseLabel = escapeHtml(input.course)
  const notesBlock =
    input.notes?.trim() ?
      `<p><strong>Notes:</strong></p><p>${escapeHtml(input.notes).replace(/\n/g, '<br/>')}</p>`
    : ''

  const [userResult, adminResult] = await Promise.all([
    resend.emails.send({
      from: `Meno Dive Club <${from}>`,
      to: input.email,
      replyTo: adminTo,
      subject: 'Booking request received — Meno Dive Club',
      html: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>Thanks for your booking request. We’ll check availability for <strong>${courseLabel}</strong> around <strong>${escapeHtml(input.preferredDate)}</strong> and email you within 24 hours with next steps.</p>
        <p>Need something sooner? WhatsApp ${escapeHtml(SITE_CONFIG.contact.phone)}.</p>
        <p>— Meno Dive Club · Gili Meno</p>
      `,
    }),
    resend.emails.send({
      from: `Site forms <${from}>`,
      to: adminTo,
      replyTo: input.email,
      subject: `[Booking] ${input.name} · ${courseLabel} · ${input.preferredDate}`,
      html: `
        <h2>New booking request</h2>
        <p><strong>Name:</strong> ${escapeHtml(input.name)}<br/>
        <strong>Email:</strong> ${escapeHtml(input.email)}<br/>
        ${input.phone ? `<strong>Phone:</strong> ${escapeHtml(input.phone)}<br/>` : ''}
        <strong>Divers:</strong> ${input.divers}<br/>
        <strong>Course / product:</strong> ${courseLabel}<br/>
        <strong>Preferred start:</strong> ${escapeHtml(input.preferredDate)}<br/>
        ${input.certification ? `<strong>Certification:</strong> ${escapeHtml(input.certification)}<br/>` : ''}
        </p>
        ${notesBlock}
      `,
    }),
  ])

  if (userResult.error) console.error('[email] booking user', userResult.error)
  if (adminResult.error) console.error('[email] booking admin', adminResult.error)

  return {
    userSent: !userResult.error,
    adminSent: !adminResult.error,
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
