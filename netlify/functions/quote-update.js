// Updates a quote row (status, assignee, processedAt, notes)
// Env:
// - ADMIN_EMAILS, SUPABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_TABLE

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PATCH') {
    return json(405, { error: 'Method Not Allowed' })
  }
  const auth = event.headers['authorization'] || ''
  if (!auth.startsWith('Bearer ')) return json(401, { error: 'Unauthorized' })
  const user = await getIdentityUser(auth, event).catch(() => null)
  if (!user) return json(401, { error: 'Unauthorized' })

  const admins = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean)
  const email = (user.email || '').toLowerCase()
  if (!admins.includes(email)) return json(403, { error: 'Forbidden' })

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
  if (!url || !key) return json(500, { error: 'Supabase not configured' })

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

function json(statusCode, data) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

async function getIdentityUser(authHeader, event) {
  const host = event.headers['x-forwarded-host'] || event.headers.host
  const proto = event.headers['x-forwarded-proto'] || 'https'
  if (!host) return null
  const url = `${proto}://${host}/.netlify/identity/user`
  const res = await fetch(url, { headers: { Authorization: authHeader } })
  if (!res.ok) return null
  return res.json()
}

