const {
  verifyAdminToken,
  verifyIdentityToken,
  fetchAccessGrant,
  touchAccessGrant,
  getClientIp,
  getOwnerEmails,
  json
} = require('./_auth')

function normalizeGrant(grant) {
  if (!grant) return null
  const role = String(grant.role || 'client').toLowerCase()
  const status = String(grant.status || 'active').toLowerCase()
  return { ...grant, role, status }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method Not Allowed' })
  }

  try {
    const admin = verifyAdminToken(event)
    return json(200, {
      allowed: true,
      via: 'token',
      grant: {
        email: admin.email,
        role: 'admin',
        status: 'active'
      }
    })
  } catch (err) {
    // continue with identity flow
  }

  let identity
  try {
    identity = await verifyIdentityToken(event)
  } catch (err) {
    return json(401, { error: err.message || 'Unauthorized' })
  }

  let grant = null
  try {
    grant = await fetchAccessGrant(identity.email)
  } catch (err) {
    return json(500, { error: err.message || 'Access lookup failed' })
  }

  if (!grant) {
    const owners = getOwnerEmails()
    if (owners.includes(identity.email)) {
      grant = {
        email: identity.email,
        role: 'admin',
        status: 'active',
        name:
          identity.user?.user_metadata?.full_name ||
          identity.user?.full_name ||
          identity.user?.name ||
          null
      }
    }
  }

  const normalized = normalizeGrant(grant)
  if (!normalized) {
    return json(200, { allowed: false, grant: null, reason: 'Account not authorized' })
  }

  const allowed = normalized.status === 'active'
  const response = {
    allowed,
    grant: normalized,
    reason: allowed ? '' : 'Account suspended'
  }

  if (allowed) {
    const now = new Date().toISOString()
    touchAccessGrant(normalized.id, {
      last_seen_at: now,
      last_seen_ip: getClientIp(event) || null,
      updated_at: now
    }).catch(() => {})
  }

  return json(200, response)
}
