import { bookings, contacts, getDb, subscribers } from '@/db'
import { sendBookingNotifications, sendContactNotifications } from '@/lib/email'

export async function saveContactAndNotify(input: {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  source: 'api' | 'netlify'
  netlifySubmissionId?: string | null
}): Promise<{ id: string }> {
  const db = getDb()
  if (!db) throw new Error('DATABASE_URL is not configured')

  const [row] = await db
    .insert(contacts)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject,
      message: input.message,
      source: input.source,
      netlifySubmissionId: input.netlifySubmissionId || null,
    })
    .returning({ id: contacts.id })

  if (!row) throw new Error('Insert failed')

  await sendContactNotifications({
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
  })

  return { id: row.id }
}

export async function saveBookingAndNotify(input: {
  name: string
  email: string
  phone?: string | null
  divers: number
  course: string
  preferredDate: string
  certification?: string | null
  notes?: string | null
  consent: boolean
  source: 'api' | 'netlify'
  netlifySubmissionId?: string | null
}): Promise<{ id: string }> {
  const db = getDb()
  if (!db) throw new Error('DATABASE_URL is not configured')

  const [row] = await db
    .insert(bookings)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      divers: input.divers,
      course: input.course,
      preferredDate: input.preferredDate,
      certification: input.certification || null,
      notes: input.notes || null,
      consent: input.consent,
      source: input.source,
      netlifySubmissionId: input.netlifySubmissionId || null,
    })
    .returning({ id: bookings.id })

  if (!row) throw new Error('Insert failed')

  await sendBookingNotifications({
    name: input.name,
    email: input.email,
    phone: input.phone,
    divers: input.divers,
    course: input.course,
    preferredDate: input.preferredDate,
    certification: input.certification,
    notes: input.notes,
  })

  return { id: row.id }
}

export async function saveSubscriber(input: { email: string; source: string }): Promise<{ ok: boolean; duplicate: boolean }> {
  const db = getDb()
  if (!db) throw new Error('DATABASE_URL is not configured')

  try {
    await db.insert(subscribers).values({ email: input.email.toLowerCase().trim(), source: input.source })
    return { ok: true, duplicate: false }
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('unique') || msg.includes('duplicate')) return { ok: true, duplicate: true }
    throw e
  }
}
