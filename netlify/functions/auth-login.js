const bcrypt = require('bcryptjs')
const { json, issuePortalToken, getClientIp } = require('./_auth')
const { fetchUserByEmail, allowedRoles } = require('./_portal')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) {
    return json(400, { error: 'Email and password are required' })
  }

  let user
  try {
    user = await fetchUserByEmail(email)
  } catch (err) {
    return json(500, { error: 'Auth lookup failed', detail: err.message })
  }

  if (!user || user.active === false) {
    return json(401, { error: 'Invalid credentials' })
  }
  if (!allowedRoles.includes(user.role)) {
    return json(401, { error: 'Invalid credentials' })
  }

  const ok = await bcrypt.compare(password, user.password_hash || '')
  if (!ok) {
    return json(401, { error: 'Invalid credentials' })
  }

  const ip = getClientIp(event)
  let token
  try {
    token = issuePortalToken(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      { ip, ttl: 60 * 60 * 12 }
    )
  } catch (err) {
    return json(500, { error: 'Token issuance failed', detail: err.message })
  }

  return json(200, {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })
}
