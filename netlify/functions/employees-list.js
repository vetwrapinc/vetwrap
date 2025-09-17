const { requireAccess, json } = require('./_auth')

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method Not Allowed' })
  }
  try {
    await requireAccess(event, { allow: ['admin', 'employee'] })
  } catch (e) {
    return json(401, { error: e.message || 'Unauthorized' })
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env.SUPABASE_EMPLOYEES_TABLE || 'employees'
  if (!url || !key) {
    return json(200, { items: [] })
  }

  const params = new URLSearchParams({ select: '*', order: 'last_name.asc', limit: '500' })
  const res = await fetch(`${url}/rest/v1/${table}?${params}`, {
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
  return json(200, { items: data })
}
