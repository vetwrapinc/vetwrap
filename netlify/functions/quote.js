// Netlify Function: /api/quote
// Env vars (set in Netlify):
// - RECAPTCHA_SECRET (optional but recommended)
// - EMAIL_PROVIDER: 'resend' | 'sendgrid' (optional)
// - RESEND_API_KEY (if using Resend)
// - SENDGRID_API_KEY (if using SendGrid)
// - QUOTE_INBOX: destination email address
// - SUPABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_TABLE (optional persistence)

/** @typedef {{name:string,email:string,projectType:string,rush?:string|boolean,notes?:string,company?:string, ['g-recaptcha-response']?:string, recaptcha?:string}} QuoteBody */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  // Basic validation
  const { name, email, projectType } = body
  if (!name || !email || !projectType) {
    return json(400, { error: 'Missing required fields' })
  }

  // Honeypot (spam)
  if (body.company) {
    // Pretend success to not tip off bots
    return json(200, { ok: true })
  }

  // reCAPTCHA verify if secret provided
  const recaptchaSecret = process.env.RECAPTCHA_SECRET
  if (recaptchaSecret) {
    const token = body['g-recaptcha-response'] || body.recaptcha
    if (!token) return json(400, { error: 'Missing reCAPTCHA token' })
    const ok = await verifyRecaptcha({ secret: recaptchaSecret, response: token, remoteip: event.headers['x-nf-client-connection-ip'] })
    if (!ok) return json(400, { error: 'Failed reCAPTCHA verification' })
  }

  const payload = normalizePayload(body, event)

  // Optional: persist to Supabase
  const db = await persistToSupabase(payload).catch(() => null)

  // Optional: email notification via Resend or SendGrid
  const mail = await sendEmail(payload).catch(() => null)

  // Optional: webhook (Slack/Discord) if QUOTE_WEBHOOK_URL provided
  await postWebhook(payload).catch(() => null)

  return json(200, { ok: true, db, mail })
}

function json(statusCode, data) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

async function verifyRecaptcha({ secret, response, remoteip }) {
  try {
    const params = new URLSearchParams({ secret, response })
    if (remoteip) params.append('remoteip', remoteip)
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    const data = await res.json()
    return !!data.success
  } catch {
    return false
  }
}

function normalizePayload(body, event) {
  const rush = body.rush === true || body.rush === 'true' || body.rush === 'on'
  const amountRush = rush ? 400 : 0
  return {
    name: String(body.name || '').slice(0, 120),
    email: String(body.email || '').slice(0, 200),
    projectType: String(body.projectType || '').slice(0, 120),
    notes: String(body.notes || '').slice(0, 5000),
    rush,
    amountRush,
    userAgent: event.headers['user-agent'] || '',
    ip: event.headers['x-nf-client-connection-ip'] || '',
    createdAt: new Date().toISOString()
  }
}

async function persistToSupabase(payload) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env.SUPABASE_TABLE || 'quotes'
  if (!url || !key) return null
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Supabase insert failed')
  const data = await res.json()
  return { id: data?.[0]?.id }
}

async function sendEmail(payload) {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase()
  const to = process.env.QUOTE_INBOX
  if (!to) return null
  const subject = `New Quote: ${payload.projectType} - ${payload.name}${payload.rush ? ' (Rush)' : ''}`
  const text = `Name: ${payload.name}\nEmail: ${payload.email}\nProject: ${payload.projectType}\nRush: ${payload.rush ? 'Yes (+$400)' : 'No'}\nNotes: ${payload.notes || '-'}\nIP: ${payload.ip}\nUA: ${payload.userAgent}\nCreated: ${payload.createdAt}`
  if (provider === 'resend') {
    const key = process.env.RESEND_API_KEY
    if (!key) return null
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: `VetWraps <no-reply@vetwraps.com>`, to, subject, text })
    })
    if (!res.ok) throw new Error('Resend failed')
    return { provider: 'resend' }
  }
  if (provider === 'sendgrid') {
    const key = process.env.SENDGRID_API_KEY
    if (!key) return null
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'no-reply@vetwraps.com', name: 'VetWraps' },
        subject,
        content: [{ type: 'text/plain', value: text }]
      })
    })
    if (!res.ok) throw new Error('SendGrid failed')
    return { provider: 'sendgrid' }
  }
  return null
}

async function postWebhook(payload) {
  const url = process.env.QUOTE_WEBHOOK_URL
  if (!url) return null
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return { ok: true }
}

