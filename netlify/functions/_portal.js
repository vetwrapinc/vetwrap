const allowedRoles = ['admin', 'employee', 'client']

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !key) throw new Error('Supabase not configured')
  return { url, key }
}

function supabaseHeaders(key, extra = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  }
}

async function supabaseSelect(table, { filters = {}, select = '*', order, limit } = {}) {
  const { url, key } = getSupabaseConfig()
  const search = new URLSearchParams()
  if (select) search.set('select', select)
  if (order) search.set('order', order)
  if (limit) search.set('limit', String(limit))
  for (const [col, filter] of Object.entries(filters)) {
    search.set(col, filter)
  }
  const endpoint = `${url}/rest/v1/${table}?${search.toString()}`
  const res = await fetch(endpoint, { headers: supabaseHeaders(key) })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase error: ${text}`)
  }
  return res.json()
}

async function supabaseMutate(table, { method, body, filters = {}, prefer }) {
  const { url, key } = getSupabaseConfig()
  const search = new URLSearchParams()
  for (const [col, filter] of Object.entries(filters)) {
    search.set(col, filter)
  }
  const endpoint = `${url}/rest/v1/${table}${search.toString() ? `?${search.toString()}` : ''}`
  const headers = supabaseHeaders(key, { 'Content-Type': 'application/json' })
  if (prefer) headers.Prefer = prefer
  const res = await fetch(endpoint, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Supabase error: ${text}`)
  }
  if (res.status === 204) return null
  return res.json()
}

async function fetchUserByEmail(email) {
  const [user] = await supabaseSelect('portal_users', {
    filters: { email: `eq.${email}` },
    select: 'id,email,name,role,password_hash,active',
    limit: 1,
  })
  return user
}

async function fetchUsersByRole(role) {
  return supabaseSelect('portal_users', {
    filters: { role: `eq.${role}`, active: 'is.true' },
    select: 'id,email,name,role,active',
    order: 'name.asc',
  })
}

async function fetchUsersByIds(ids = []) {
  if (!ids.length) return []
  return supabaseSelect('portal_users', {
    filters: { id: `in.(${ids.join(',')})`, active: 'is.true' },
    select: 'id,email,name,role,active',
    order: 'name.asc',
  })
}

async function fetchAssignments({ clientId, employeeId } = {}) {
  const filters = {}
  if (clientId) filters.client_id = `eq.${clientId}`
  if (employeeId) filters.employee_id = `eq.${employeeId}`
  return supabaseSelect('portal_assignments', {
    filters,
    select: 'client_id,employee_id,created_at,updated_at',
    order: 'created_at.asc',
  })
}

module.exports = {
  allowedRoles,
  getSupabaseConfig,
  supabaseHeaders,
  supabaseSelect,
  supabaseMutate,
  fetchUserByEmail,
  fetchUsersByRole,
  fetchUsersByIds,
  fetchAssignments,
}
