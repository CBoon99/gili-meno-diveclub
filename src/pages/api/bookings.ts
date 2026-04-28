import type { APIRoute } from 'astro'

import { bookingApiSchema } from '@/lib/form-schemas'
import { getDb } from '@/db'
import { saveBookingAndNotify } from '@/lib/submissions'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  if (!getDb()) {
    return new Response(JSON.stringify({ error: 'database_unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const parsed = bookingApiSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'validation', details: parsed.error.flatten() }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { id } = await saveBookingAndNotify({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      divers: parsed.data.divers,
      course: parsed.data.course,
      preferredDate: parsed.data.date,
      certification: parsed.data.certification,
      notes: parsed.data.notes,
      consent: parsed.data.consent,
      source: 'api',
    })
    return new Response(JSON.stringify({ ok: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[api/bookings]', e)
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
