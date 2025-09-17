const { requireAccess, json } = require('./_auth')

const allowedStatuses = new Set(['active', 'on_leave', 'former'])

function sanitize(value, max = 120) {
  if (value === null || value === undefined) return ''
  return String(value).trim().slice(0, max)
}

function parseDate(value) {
  if (!value) return null
  const s = String(value).trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  return s
}

function parseRate(value) {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  if (!Number.isFinite(num)) return null
  return Math.round(num * 100) / 100
}

exports.handler = async (event) => {
  if (!['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
    return json(405, { error: 'Method Not Allowed' })
  }
  try {
    await requireAccess(event, { allow: ['admin'] })
  } catch (e) {
    return json(401, { error: e.message || 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch (err) {
    return json(400, { error: 'Invalid JSON' })
  }

  const firstName = sanitize(body.firstName)
  const lastName = sanitize(body.lastName)
  const role = sanitize(body.role)
  const email = sanitize(body.email, 200).toLowerCase()
  if (!firstName || !lastName || !role || !email) {
    return json(400, { error: 'Missing required fields' })
  }

  const statusRaw = sanitize(body.status, 30).toLowerCase()
  const status = allowedStatuses.has(statusRaw) ? statusRaw : 'active'
  const now = new Date().toISOString()

  const record = {
    first_name: firstName,
    last_name: lastName,
    role,
    email,
    phone: sanitize(body.phone, 40) || null,
    status,
    start_date: parseDate(body.startDate),
    hourly_rate: parseRate(body.hourlyRate),
    notes: sanitize(body.notes, 2000) || null,
    updated_at: now
  }

  if (!body.id) {
    record.created_at = now
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env.SUPABASE_EMPLOYEES_TABLE || 'employees'
  if (!url || !key) {
    return json(500, { error: 'Supabase not configured' })
  }

  const method = body.id ? 'PATCH' : 'POST'
  const endpoint = body.id
    ? `${url}/rest/v1/${table}?id=eq.${encodeURIComponent(body.id)}`
    : `${url}/rest/v1/${table}`

  const res = await fetch(endpoint, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(record)
  })

  if (!res.ok) {
    const detail = await res.text()
    return json(502, { error: 'Supabase error', detail })
  }

  const data = await res.json()
  return json(200, { ok: true, item: Array.isArray(data) ? data[0] : data })
}
