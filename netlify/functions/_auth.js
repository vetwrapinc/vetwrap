const crypto = require('crypto')

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

function getClientIp(event) {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for'] ||
    event.headers['client-ip'] ||
    event.headers['x-real-ip'] ||
    ''
  ).split(',')[0].trim()
}

function verifyAdminToken(event, options = {}) {
  const header = event.headers['x-admin-token'] || event.headers['X-Admin-Token']
  const secret = process.env.ADMIN_TOKEN_SECRET
  if (!secret) throw new Error('Admin token not configured')
  if (!header) throw new Error('Missing admin token')
  const payload = decryptToken(header.trim(), secret)
  const now = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number' || payload.exp < now) throw new Error('Token expired')
  const ip = getClientIp(event)
  if (!ip || payload.ip !== ip) throw new Error('IP mismatch')
  const admins = (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  const email = String(payload.email || '').toLowerCase()
  if (!admins.includes(email)) throw new Error('Not authorized')
  return { email, ip, payload }
}

function json(statusCode, data) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

module.exports = { verifyAdminToken, json, getClientIp }

