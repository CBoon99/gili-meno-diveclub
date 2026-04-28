import { bookingApiSchema, contactApiSchema } from '@/lib/form-schemas'
import { getDb } from '@/db'
import { isNetlifySubmissionProcessed, parseNetlifyFormBody } from '@/lib/netlify-form'
import { saveBookingAndNotify, saveContactAndNotify } from '@/lib/submissions'

export type WebhookResult = { status: number; body: Record<string, unknown> }

/**
 * Handles Netlify “Form submission notifications → Outgoing webhook” payloads.
 * Returns 2xx even on validation errors so Netlify does not retry indefinitely.
 */
export async function handleNetlifyFormWebhook(jsonBody: unknown): Promise<WebhookResult> {
  const db = getDb()
  if (!db) {
    console.error('[netlify-webhook] DATABASE_URL missing')
    return { status: 503, body: { error: 'database_unavailable' } }
  }

  const parsed = parseNetlifyFormBody(jsonBody)
  if (!parsed) {
    console.warn('[netlify-webhook] Unparseable body')
    return { status: 200, body: { ok: false, reason: 'unparseable' } }
  }

  const { formName, submissionId, fields } = parsed

  if (formName === 'contact') {
    const v = contactApiSchema.safeParse({
      name: fields.name,
      email: fields.email,
      phone: fields.phone?.trim() || undefined,
      subject: fields.subject,
      message: fields.message,
    })
    if (!v.success) {
      console.warn('[netlify-webhook] contact validation', v.error.flatten())
      return { status: 200, body: { ok: false, reason: 'validation' } }
    }

    if (submissionId && (await isNetlifySubmissionProcessed('contact', submissionId))) {
      return { status: 200, body: { ok: true, duplicate: true } }
    }

    try {
      const { id } = await saveContactAndNotify({
        ...v.data,
        source: 'netlify',
        netlifySubmissionId: submissionId,
      })
      return { status: 200, body: { ok: true, id } }
    } catch (e) {
      console.error('[netlify-webhook] contact persist', e)
      if (isUniqueViolation(e)) return { status: 200, body: { ok: true, duplicate: true } }
      return { status: 500, body: { error: 'persist_failed' } }
    }
  }

  if (formName === 'booking') {
    const divers = Number.parseInt(fields.divers || '1', 10)
    const consentRaw = fields.consent
    const consent =
      consentRaw === 'on' || consentRaw === 'true' || consentRaw === '1' || consentRaw === 'yes'

    const v = bookingApiSchema.safeParse({
      name: fields.name,
      email: fields.email,
      phone: fields.phone?.trim() || undefined,
      divers: Number.isFinite(divers) ? divers : 1,
      course: fields.course,
      date: fields.date,
      certification: fields.certification?.trim() || undefined,
      notes: fields.notes?.trim() || undefined,
      consent,
    })
    if (!v.success) {
      console.warn('[netlify-webhook] booking validation', v.error.flatten())
      return { status: 200, body: { ok: false, reason: 'validation' } }
    }

    if (submissionId && (await isNetlifySubmissionProcessed('booking', submissionId))) {
      return { status: 200, body: { ok: true, duplicate: true } }
    }

    try {
      const { id } = await saveBookingAndNotify({
        name: v.data.name,
        email: v.data.email,
        phone: v.data.phone,
        divers: v.data.divers,
        course: v.data.course,
        preferredDate: v.data.date,
        certification: v.data.certification,
        notes: v.data.notes,
        consent: v.data.consent,
        source: 'netlify',
        netlifySubmissionId: submissionId,
      })
      return { status: 200, body: { ok: true, id } }
    } catch (e) {
      console.error('[netlify-webhook] booking persist', e)
      if (isUniqueViolation(e)) return { status: 200, body: { ok: true, duplicate: true } }
      return { status: 500, body: { error: 'persist_failed' } }
    }
  }

  return { status: 200, body: { ok: true, ignored: true, formName } }
}

function isUniqueViolation(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e)
  return /unique|duplicate/i.test(msg)
}
