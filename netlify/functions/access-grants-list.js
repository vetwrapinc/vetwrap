const { requireAccess, json, getSupabaseConfig } = require('./_auth')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method Not Allowed' })
  }

  try {
    await requireAccess(event, { allow: ['admin'] })
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  let config
  try {
    config = getSupabaseConfig('SUPABASE_ACCESS_TABLE', 'access_grants')
  } catch (err) {
    return json(500, { error: err.message || 'Access store unavailable' })
  }

  const { url, key, table } = config
  const params = new URLSearchParams({
    select:
      'id,email,name,role,status,notes,last_seen_at,last_seen_ip,allow_password,password_updated_at,created_at,updated_at',
    order: 'updated_at.desc'
  })
  const qs = event.queryStringParameters || {}
  if (qs.status) params.append('status', `eq.${String(qs.status).toLowerCase()}`)
  if (qs.role) params.append('role', `eq.${String(qs.role).toLowerCase()}`)

  const res = await fetch(`${url}/rest/v1/${table}?${params.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  })

  if (!res.ok) {
    const detail = await res.text()
    return json(502, { error: 'Supabase error', detail })
  }

  const data = await res.json()
  return json(200, { items: Array.isArray(data) ? data : [] })
}
