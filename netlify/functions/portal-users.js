const bcrypt = require('bcryptjs')
const { json, verifyPortalToken } = require('./_auth')
const { allowedRoles, supabaseMutate } = require('./_portal')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' })
  }

  try {
    verifyPortalToken(event, { requireRole: 'admin' })
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }

  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const role = String(body.role || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!name || !email || !password) {
    return json(400, { error: 'Name, email, and password are required' })
  }
  if (!allowedRoles.includes(role)) {
    return json(400, { error: 'Unsupported role' })
  }

  const hash = await bcrypt.hash(password, 12)

  try {
    const inserted = await supabaseMutate('portal_users', {
      method: 'POST',
      body: {
        name,
        email,
        role,
        password_hash: hash,
        active: true,
      },
      prefer: 'return=representation',
    })

    const created = inserted?.[0]
    if (!created) {
      return json(500, { error: 'Failed to create user' })
    }

    return json(201, {
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
      },
    })
  } catch (err) {
    return json(500, { error: 'User creation failed', detail: err.message })
  }
}
