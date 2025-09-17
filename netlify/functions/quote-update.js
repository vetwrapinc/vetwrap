// Updates a quote row (status, assignee, processedAt, notes)
// Env:
// - ADMIN_EMAILS, SUPABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_TABLE

const { requireAccess, json } = require('./_auth')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PATCH') {
    return json(405, { error: 'Method Not Allowed' })
  }
  try {
    await requireAccess(event, { allow: ['admin', 'employee'] })
  } catch (e) {
    return json(401, { error: e.message || 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch { return json(400, { error: 'Invalid JSON' }) }

  const id = body.id
  if (!id) return json(400, { error: 'Missing id' })

  const patch = {}
  if (typeof body.status === 'string') patch.status = body.status
  if (typeof body.assignee === 'string') patch.assignee = body.assignee
  if (body.processedAt === true) patch.processedAt = new Date().toISOString()
  if (body.processedAt === null) patch.processedAt = null
  if (Object.keys(patch).length === 0) return json(400, { error: 'No updates' })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env.SUPABASE_TABLE || 'quotes'
  if (!url || !key) return json(200, { ok: false, skipped: 'Supabase not configured' })

  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(patch)
  })
  if (!res.ok) {
    const text = await res.text()
    return json(502, { error: 'Supabase error', detail: text })
  }
  const data = await res.json()
  return json(200, { ok: true, item: data?.[0] })
}
