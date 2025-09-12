// Lists recent quotes from Supabase. Requires Netlify Identity token and admin email allowlist.
// Env:
// - ADMIN_EMAILS: comma-separated emails allowed to access
// - SUPABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_TABLE (default 'quotes')

const { verifyAdminToken, json } = require('./_auth')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method Not Allowed' })
  }
  try {
    verifyAdminToken(event)
  } catch (e) {
    return json(401, { error: e.message || 'Unauthorized' })
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env.SUPABASE_TABLE || 'quotes'
  if (!url || !key) return json(200, { items: [] })

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
