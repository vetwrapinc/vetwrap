const { requireAccess, json, getSupabaseConfig } = require('./_auth')

exports.handler = async (event) => {
  if (!['POST', 'DELETE'].includes(event.httpMethod)) {
    return json(405, { error: 'Method Not Allowed' })
  }

  try {
    await requireAccess(event, { allow: ['admin'] })
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  let id
  if (event.httpMethod === 'DELETE') {
    id = event.queryStringParameters?.id
  } else {
    try {
      const payload = JSON.parse(event.body || '{}')
      id = payload.id
    } catch (err) {
      return json(400, { error: 'Invalid JSON' })
    }
  }

  if (id) id = String(id).trim()
  if (!id) {
    return json(400, { error: 'Missing id' })
  }

  let config
  try {
    config = getSupabaseConfig('SUPABASE_ACCESS_TABLE', 'access_grants')
  } catch (err) {
    return json(500, { error: err.message || 'Access store unavailable' })
  }

  const { url, key, table } = config
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
