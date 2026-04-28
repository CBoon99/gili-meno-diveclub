import { eq } from 'drizzle-orm'

import { bookings, contacts, getDb } from '@/db'

type NetlifyFieldMap = Record<string, string>

/** Parse Netlify form notification / submission-created JSON body */
export function parseNetlifyFormBody(body: unknown): {
  formName: string
  submissionId: string | null
  fields: NetlifyFieldMap
} | null {
  if (body === null || typeof body !== 'object') return null

  const root = body as Record<string, unknown>
  const payload =
    root.payload !== undefined && typeof root.payload === 'object' && root.payload !== null ?
      (root.payload as Record<string, unknown>)
    : root

  const formNameRaw =
    (payload.form_name as string | undefined) ||
    (payload['form-name'] as string | undefined) ||
    (root['form-name'] as string | undefined) ||
    ''

  const formName = formNameRaw.trim().toLowerCase()
  if (!formName) return null

  const submissionId =
    typeof payload.id === 'string' ? payload.id
    : typeof root.id === 'string' ? root.id
    : null

  const dataObj: Record<string, unknown> =
    payload.data !== undefined && typeof payload.data === 'object' && payload.data !== null ?
      (payload.data as Record<string, unknown>)
    : {}

  const fields: NetlifyFieldMap = {}

  for (const [k, v] of Object.entries(dataObj)) {
    if (k === 'form-name' || k === 'form_name' || k === 'bot-field') continue
    if (v === null || v === undefined) continue
    if (typeof v === 'string') fields[k] = v
    else if (typeof v === 'number' || typeof v === 'boolean') fields[k] = String(v)
  }

  return { formName, submissionId, fields }
}

export async function isNetlifySubmissionProcessed(
  formName: 'contact' | 'booking',
  submissionId: string | null,
): Promise<boolean> {
  if (!submissionId) return false
  const db = getDb()
  if (!db) return false
  if (formName === 'contact') {
    const rows = await db.select({ id: contacts.id }).from(contacts).where(eq(contacts.netlifySubmissionId, submissionId))
    return rows.length > 0
  }
  const rows = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.netlifySubmissionId, submissionId))
  return rows.length > 0
}
