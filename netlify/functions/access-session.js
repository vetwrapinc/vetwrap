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
  const allowPassword = Boolean(grant.allow_password || grant.allowPassword)
  const passwordUpdatedAt = grant.password_updated_at || grant.passwordUpdatedAt || null
  const sanitized = {
    id: grant.id || null,
    email: grant.email,
    name: grant.name || null,
    role,
    status,
    notes: grant.notes || null,
    created_at: grant.created_at || grant.createdAt || null,
    updated_at: grant.updated_at || grant.updatedAt || null,
    last_seen_at: grant.last_seen_at || grant.lastSeenAt || null,
    last_seen_ip: grant.last_seen_ip || grant.lastSeenIp || null,
    allowPassword,
    passwordUpdatedAt
  }
  return sanitized
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method Not Allowed' })
  }

  try {
    const admin = await verifyAdminToken(event)
    return json(200, {
      allowed: true,
      via: 'token',
      grant: {
        email: admin.email,
        role: admin.role || 'admin',
        status: 'active',
        allowPassword: Boolean(admin.grant?.allow_password)
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
    return json(200, { allowed: false, grant: null, reason: 'Incorrect email or password.' })
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
