const crypto = require('crypto')

const ACCESS_ROLES = ['admin', 'employee', 'client']

function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4
  if (pad) s += '='.repeat(4 - pad)
  return Buffer.from(s, 'base64')
}

function b64urlEncode(buffer) {
  return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function deriveKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest()
}

// Token format: v1.<iv>.<ciphertext>.<tag> where components are base64url
function decryptToken(token, secret) {
  if (!token || typeof token !== 'string') throw new Error('Missing token')
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== 'v1') throw new Error('Bad token format')
  const iv = b64urlDecode(parts[1])
  const ciphertext = b64urlDecode(parts[2])
  const tag = b64urlDecode(parts[3])
  const key = deriveKey(secret)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const pt = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  const json = JSON.parse(pt.toString('utf8'))
  return json
}

function encryptToken(payload, secret) {
  const key = deriveKey(secret)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${b64urlEncode(iv)}.${b64urlEncode(ciphertext)}.${b64urlEncode(tag)}`
}

function getClientIp(event) {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for'] ||
    event.headers['client-ip'] ||
    event.headers['x-real-ip'] ||
    ''
  ).split(',')[0].trim()
}

function getIdentityBaseUrl(event) {
  const fromEnv = process.env.IDENTITY_URL || process.env.IDENTITY_INSTANCE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const proto = event.headers['x-forwarded-proto'] || 'https'
  const host = event.headers['x-forwarded-host'] || event.headers['host']
  if (!host) throw new Error('Identity service unavailable')
  return `${proto}://${host}/.netlify/identity`
}

async function verifyIdentityToken(event) {
  const auth = event.headers.authorization || event.headers.Authorization
  if (!auth || !auth.toLowerCase().startsWith('bearer ')) {
    throw new Error('Missing identity token')
  }
  const token = auth.slice(auth.indexOf(' ') + 1).trim()
  if (!token) throw new Error('Missing identity token')
  const baseUrl = getIdentityBaseUrl(event)
  const res = await fetch(`${baseUrl}/user`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || 'Invalid identity token')
  }
  const data = await res.json()
  const email = String(data.email || '').toLowerCase()
  if (!email) throw new Error('Identity email missing')
  return { token, user: data, email }
}

function getAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function getOwnerEmails() {
  const raw = process.env.IDENTITY_OWNER_EMAILS || process.env.OWNER_EMAILS || process.env.ADMIN_EMAILS || ''
  const defaults = ['vetwrapinc@gmail.com']
  const list = raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  defaults.forEach((email) => {
    if (!list.includes(email)) list.push(email)
  })
  return list
}

async function verifyAdminToken(event) {
  const header = event.headers['x-admin-token'] || event.headers['X-Admin-Token']
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!secret) throw new Error('Admin token not configured')
  if (!header) throw new Error('Missing admin token')
  const payload = decryptToken(header.trim(), secret)
  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp < now) throw new Error('Token expired')
  const ip = getClientIp(event)
  if (!ip || payload.ip !== ip) throw new Error('IP mismatch')
  const email = String(payload.email || '').toLowerCase()
  if (!email) throw new Error('Not authorized')
  const declaredRole = String(payload.role || '').toLowerCase()
  const role = ACCESS_ROLES.includes(declaredRole) ? declaredRole : 'client'
  const admins = getAdminEmails()
  if (admins.includes(email)) {
    return { email, ip, payload, role: 'admin', grant: { email, role: 'admin', status: 'active' } }
  }
  const grant = await fetchAccessGrant(email)
  if (!grant) throw new Error('Not authorized')
  const status = String(grant.status || 'active').toLowerCase()
  if (status !== 'active') throw new Error('Account suspended')
  const normalizedRole = ACCESS_ROLES.includes(String(grant.role || '').toLowerCase())
    ? String(grant.role || '').toLowerCase()
    : role
  if (payload.grantId && grant.id && payload.grantId !== grant.id) {
    throw new Error('Not authorized')
  }
  return {
    email,
    ip,
    payload,
    role: normalizedRole,
    grant: { ...grant, role: normalizedRole, status }
  }
}

function getSupabaseConfig(tableEnv, fallbackTable) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  const table = process.env[tableEnv] || fallbackTable
  if (!url || !key || !table) throw new Error('Supabase not configured')
  return { url, key, table }
}

async function fetchAccessGrant(email) {
  if (!email) return null
  let config
  try {
    config = getSupabaseConfig('SUPABASE_ACCESS_TABLE', 'access_grants')
  } catch (err) {
    return null
  }
  const { url, key, table } = config
  const res = await fetch(
    `${url}/rest/v1/${table}?email=eq.${encodeURIComponent(email)}&limit=1`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    }
  )
  if (!res.ok) {
    throw new Error('Supabase access lookup failed')
  }
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null
  return data[0]
}

async function touchAccessGrant(id, patch) {
  if (!id) return
  let config
  try {
    config = getSupabaseConfig('SUPABASE_ACCESS_TABLE', 'access_grants')
  } catch (err) {
    return
  }
  const { url, key, table } = config
  await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(patch)
  }).catch(() => {})
}

async function requireAccess(event, options = {}) {
  const allowRoles = Array.isArray(options.allow) ? options.allow : []
  const allowSuspended = Boolean(options.allowSuspended)
  const requireAdmin = Boolean(options.requireAdmin)

  try {
    const admin = await verifyAdminToken(event)
    return {
      type: 'admin-token',
      email: admin.email,
      role: admin.role,
      isAdmin: admin.role === 'admin',
      grant: admin.grant || { email: admin.email, role: admin.role, status: 'active' }
    }
  } catch (err) {
    // continue to identity flow
  }

  const identity = await verifyIdentityToken(event)
  const email = identity.email
  let grant = null
  try {
    grant = await fetchAccessGrant(email)
  } catch (err) {
    throw err
  }

  const ownerEmails = getOwnerEmails()
  if (!grant && ownerEmails.includes(email)) {
    grant = {
      email,
      role: 'admin',
      status: 'active'
    }
  }

  if (!grant) {
    throw new Error('Account not authorized')
  }

  const role = String(grant.role || '').toLowerCase()
  const normalizedRole = ACCESS_ROLES.includes(role) ? role : 'client'
  const status = String(grant.status || '').toLowerCase() || 'active'

  if (!allowSuspended && status !== 'active') {
    throw new Error('Account suspended')
  }
  if (requireAdmin && normalizedRole !== 'admin') {
    throw new Error('Admin privileges required')
  }
  if (allowRoles.length > 0 && !allowRoles.includes(normalizedRole)) {
    throw new Error('Access denied')
  }

  const now = new Date().toISOString()
  const ip = getClientIp(event) || null
  touchAccessGrant(grant.id, {
    last_seen_at: now,
    last_seen_ip: ip,
    updated_at: now
  }).catch(() => {})

  return {
    type: 'identity',
    email,
    role: normalizedRole,
    isAdmin: normalizedRole === 'admin',
    grant: { ...grant, role: normalizedRole, status }
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return { salt, hash }
}

function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) return false
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expectedHash, 'hex'), Buffer.from(derived, 'hex'))
  } catch (err) {
    return expectedHash === derived
  }
}

function issueAdminAccessToken(event, { email, role = 'admin', grantId = null, ttlSeconds = 6 * 60 * 60 } = {}) {
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!secret) throw new Error('Admin token not configured')
  const ip = getClientIp(event)
  if (!ip) throw new Error('Unable to determine client IP')
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    v: 1,
    email,
    role,
    ip,
    iat: now,
    exp: now + Math.max(60, Number(ttlSeconds) || 0),
    nonce: crypto.randomBytes(12).toString('hex')
  }
  if (grantId) payload.grantId = grantId
  return encryptToken(payload, secret)
}

function json(statusCode, data) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

module.exports = {
  verifyAdminToken,
  verifyIdentityToken,
  fetchAccessGrant,
  requireAccess,
  json,
  getClientIp,
  touchAccessGrant,
  ACCESS_ROLES,
  getOwnerEmails,
  getSupabaseConfig,
  hashPassword,
  verifyPassword,
  issueAdminAccessToken
}

