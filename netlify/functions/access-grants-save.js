const { requireAccess, json, ACCESS_ROLES, getSupabaseConfig } = require('./_auth')

const allowedStatuses = new Set(['active', 'suspended'])

function sanitize(value, max = 160) {
  if (value === undefined || value === null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

exports.handler = async (event) => {
  if (!['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
    return json(405, { error: 'Method Not Allowed' })
  }

  try {
    await requireAccess(event, { allow: ['admin'] })
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch (err) {
    return json(400, { error: 'Invalid JSON' })
  }

  const id = sanitize(payload.id, 80)
  const email = sanitize(payload.email, 200)?.toLowerCase()
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(400, { error: 'Valid email required' })
  }

  const role = (sanitize(payload.role, 40) || 'client').toLowerCase()
  if (!ACCESS_ROLES.includes(role)) {
    return json(400, { error: 'Invalid role' })
  }

  const status = (sanitize(payload.status, 40) || 'active').toLowerCase()
  if (!allowedStatuses.has(status)) {
    return json(400, { error: 'Invalid status' })
  }

  const now = new Date().toISOString()
  const record = {
    email,
    name: sanitize(payload.name, 160),
    role,
    status,
    notes: sanitize(payload.notes, 2000),
    updated_at: now
  }
  if (!id) {
    record.created_at = now
  }

  let config
  try {
    config = getSupabaseConfig('SUPABASE_ACCESS_TABLE', 'access_grants')
  } catch (err) {
    return json(500, { error: err.message || 'Access store unavailable' })
  }

  const { url, key, table } = config
  const method = id ? 'PATCH' : 'POST'
  const endpoint = id
    ? `${url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`
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
  const item = Array.isArray(data) ? data[0] : data
  return json(200, { ok: true, item })
}
