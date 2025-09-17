const { verifyAdminToken, json } = require('./_auth')

exports.handler = async (event) => {
  if (!['POST', 'DELETE'].includes(event.httpMethod)) {
    return json(405, { error: 'Method Not Allowed' })
  }
  try {
    verifyAdminToken(event)
  } catch (e) {
    return json(401, { error: e.message || 'Unauthorized' })
  }

  let id
  if (event.httpMethod === 'DELETE') {
    id = event.queryStringParameters?.id
  } else {
    try {
      const body = JSON.parse(event.body || '{}')
      id = body.id
    } catch (err) {
      return json(400, { error: 'Invalid JSON' })
    }
  }

  if (!id) {
    return json(400, { error: 'Missing id' })
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env.SUPABASE_EMPLOYEES_TABLE || 'employees'
  if (!url || !key) {
    return json(500, { error: 'Supabase not configured' })
  }

  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=minimal'
    }
  })

  if (!res.ok) {
    const detail = await res.text()
    return json(502, { error: 'Supabase error', detail })
  }

  return json(200, { ok: true })
}
