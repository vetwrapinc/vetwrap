const {
  fetchAccessGrant,
  json,
  verifyPassword,
  issueAdminAccessToken,
  ACCESS_ROLES,
  touchAccessGrant,
  getClientIp
} = require('./_auth')

function sanitize(value) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' })
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch (err) {
    return json(400, { error: 'Invalid JSON' })
  }

  const email = sanitize(payload.email).toLowerCase()
  const password = sanitize(payload.password)
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(400, { error: 'Valid email required' })
  }
  if (!password) {
    return json(400, { error: 'Password required' })
  }

  let grant
  try {
    grant = await fetchAccessGrant(email)
  } catch (err) {
    return json(500, { error: err.message || 'Unable to verify credentials' })
  }

  if (!grant) {
    return json(401, { error: 'Incorrect email or password.' })
  }

  const status = String(grant.status || 'active').toLowerCase()
  if (status !== 'active') {
    return json(403, { error: 'Account suspended.' })
  }

  const allowPassword = Boolean(grant.allow_password)
  if (!allowPassword || !grant.password_hash || !grant.password_salt) {
    return json(403, { error: 'Email sign-in disabled for this account.' })
  }

  const valid = verifyPassword(password, grant.password_salt, grant.password_hash)
  if (!valid) {
    return json(401, { error: 'Incorrect email or password.' })
  }

  const roleRaw = String(grant.role || 'client').toLowerCase()
  const role = ACCESS_ROLES.includes(roleRaw) ? roleRaw : 'client'

  let token
  try {
    token = issueAdminAccessToken(event, {
      email: grant.email.toLowerCase(),
      role,
      grantId: grant.id || null,
      ttlSeconds: 6 * 60 * 60
    })
  } catch (err) {
    return json(500, { error: err.message || 'Unable to issue session token' })
  }

  const nowIso = new Date().toISOString()
  const ip = getClientIp(event) || null
  touchAccessGrant(grant.id, {
    last_seen_at: nowIso,
    last_seen_ip: ip,
    updated_at: nowIso
  }).catch(() => {})

  return json(200, {
    ok: true,
    token,
    grant: {
      id: grant.id || null,
      email: grant.email,
      name: grant.name || null,
      role,
      status,
      allowPassword: true,
      passwordUpdatedAt: grant.password_updated_at || null
    }
  })
}
