import type { APIRoute } from 'astro'

import { handleNetlifyFormWebhook } from '@/lib/handle-netlify-webhook'

export const prerender = false

/**
 * Netlify UI: Site settings → Forms → Form submission notifications → Outgoing webhook
 * URL: `https://menodiveclub.com/api/webhooks/netlify-form?token=YOUR_SECRET`
 * (Set `NETLIFY_WEBHOOK_SECRET` in Netlify env to match `token`.)
 */
export const POST: APIRoute = async ({ request }) => {
  const secret = process.env.NETLIFY_WEBHOOK_SECRET
  if (secret) {
    const url = new URL(request.url)
    if (url.searchParams.get('token') !== secret) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  let jsonBody: unknown
  try {
    jsonBody = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { status, body } = await handleNetlifyFormWebhook(jsonBody)
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
