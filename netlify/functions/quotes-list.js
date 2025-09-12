// Lists recent quotes from Supabase. Requires Netlify Identity token and admin email allowlist.
// Env:
// - ADMIN_EMAILS: comma-separated emails allowed to access
// - SUPABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_TABLE (default 'quotes')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method Not Allowed' })
  }
  const auth = event.headers['authorization'] || ''
  if (!auth.startsWith('Bearer ')) return json(401, { error: 'Unauthorized' })

  const user = await getIdentityUser(auth, event).catch(() => null)
  if (!user) return json(401, { error: 'Unauthorized' })

  const admins = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const email = (user.email || '').toLowerCase()
  if (!admins.includes(email)) return json(403, { error: 'Forbidden' })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env.SUPABASE_TABLE || 'quotes'
  if (!url || !key) return json(500, { error: 'Supabase not configured' })

  const search = new URLSearchParams({ select: '*', order: 'createdAt.desc', limit: '50' })
  const res = await fetch(`${url}/rest/v1/${table}?${search}`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  })
  if (!res.ok) {
    const text = await res.text()
    return json(502, { error: 'Supabase error', detail: text })
  }
  const data = await res.json()
  return json(200, { items: data })
}

function json(statusCode, data) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

async function getIdentityUser(authHeader, event) {
  // Verify via site Identity endpoint using the provided bearer token
  const host = event.headers['x-forwarded-host'] || event.headers.host
  const proto = event.headers['x-forwarded-proto'] || 'https'
  if (!host) return null
  const url = `${proto}://${host}/.netlify/identity/user`
  const res = await fetch(url, { headers: { Authorization: authHeader } })
  if (!res.ok) return null
  return res.json()
}

