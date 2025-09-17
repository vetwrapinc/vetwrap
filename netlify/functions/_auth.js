const crypto = require('crypto')

const TOKEN_VERSION = 'v1'

function b64urlDecode(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4
  if (pad) s += '='.repeat(4 - pad)
  return Buffer.from(s, 'base64')
}

function b64urlEncode(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function deriveKey(secret) {
  return crypto.createHash('sha256').update(String(secret)).digest()
}

function getClientIp(event) {
  if (!event || !event.headers) return ''
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for'] ||
    event.headers['client-ip'] ||
    event.headers['x-real-ip'] ||
    ''
  ).split(',')[0].trim()
}

function getTokenSecret() {
  return process.env.PORTAL_TOKEN_SECRET || process.env.ADMIN_TOKEN_SECRET
}

function decryptToken(token, secret) {
  if (!token || typeof token !== 'string') throw new Error('Missing token')
  const parts = token.split('.')
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) throw new Error('Bad token format')
  const iv = b64urlDecode(parts[1])
  const ciphertext = b64urlDecode(parts[2])
  const tag = b64urlDecode(parts[3])
  const key = deriveKey(secret)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const pt = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return JSON.parse(pt.toString('utf8'))
}

function issuePortalToken(claims = {}, options = {}) {
  const secret = getTokenSecret()
  if (!secret) throw new Error('Portal token not configured')
  const key = deriveKey(secret)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    ...claims,
    iat: now,
    exp: now + (options.ttl || 86400),
  }
  if (options.ip) payload.ip = options.ip
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${TOKEN_VERSION}.${b64urlEncode(iv)}.${b64urlEncode(ciphertext)}.${b64urlEncode(tag)}`
}

function extractAuthToken(event, headerName) {
  if (!event || !event.headers) return null
  if (headerName) {
    const value = event.headers[headerName] || event.headers[headerName.toLowerCase()] || event.headers[headerName.toUpperCase()]
    if (value) return String(value).trim()
  }
  const auth = event.headers['authorization'] || event.headers['Authorization']
  if (auth && typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim()
  }
  const legacy = event.headers['x-admin-token'] || event.headers['X-Admin-Token']
  if (legacy) return String(legacy).trim()
  return null
}

function verifyPortalToken(eventOrToken, options = {}) {
  const secret = getTokenSecret()
  if (!secret) throw new Error('Portal token not configured')

  let event = null
  let token = options.token
  if (typeof eventOrToken === 'string') {
    token = token || eventOrToken
  } else {
    event = eventOrToken
    token = token || extractAuthToken(event, options.headerName)
  }
  if (!token) throw new Error('Missing token')

  const payload = decryptToken(token, secret)
  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp < now) throw new Error('Token expired')

  if (event && options.checkIp !== false) {
    const ip = getClientIp(event)
    if (payload.ip && ip && payload.ip !== ip) throw new Error('IP mismatch')
  }

  if (options.requireRole && payload.role !== options.requireRole) {
    throw new Error('Not authorized')
  }
  if (options.allowRoles && !options.allowRoles.includes(payload.role)) {
    throw new Error('Not authorized')
  }

  return { token, payload }
}

function verifyAdminToken(event, options = {}) {
  const { payload } = verifyPortalToken(event, { requireRole: 'admin', ...options })
  const admins = (process.env.ADMIN_EMAILS || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (admins.length > 0) {
    const email = String(payload.email || '').toLowerCase()
    if (!admins.includes(email)) throw new Error('Not authorized')
  }
  return payload
}

function json(statusCode, data) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

module.exports = {
  verifyAdminToken,
  verifyPortalToken,
  issuePortalToken,
  json,
  getClientIp,
}
