import CryptoJS from 'crypto-js'

const PORTAL_STORAGE_KEY = 'vetwraps.portal.assignments'
const SESSION_STORAGE_KEY = 'vetwraps.portal.session'
const SECRET = 'vetwraps-client-matrix-2024'

function clone(value) {
  return value ? JSON.parse(JSON.stringify(value)) : value
}

function encryptPayload(payload) {
  return CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET).toString()
}

function decryptPayload(cipherText) {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET)
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  if (!decrypted) return null
  return JSON.parse(decrypted)
}

export function loadPortalState(fallbackState) {
  if (typeof window === 'undefined') return clone(fallbackState)
  const stored = window.localStorage.getItem(PORTAL_STORAGE_KEY)
  if (!stored) return clone(fallbackState)
  try {
    const parsed = decryptPayload(stored)
    if (!parsed) return clone(fallbackState)
    return mergeWithFallback(parsed, fallbackState)
  } catch (error) {
    console.warn('Failed to decrypt portal state. Resetting to fallback.', error)
    return clone(fallbackState)
  }
}

export function savePortalState(state) {
  if (typeof window === 'undefined') return
  try {
    const cipher = encryptPayload(state)
    window.localStorage.setItem(PORTAL_STORAGE_KEY, cipher)
  } catch (error) {
    console.warn('Unable to persist encrypted portal state', error)
  }
}

export function clearPortalState() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(PORTAL_STORAGE_KEY)
}

export function createSession(session) {
  if (typeof window === 'undefined') return null
  const enriched = { ...session, createdAt: new Date().toISOString() }
  try {
    const encrypted = encryptPayload(enriched)
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, encrypted)
    return enriched
  } catch (error) {
    console.warn('Unable to persist encrypted session', error)
    return null
  }
}

export function readSession() {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    return decryptPayload(raw)
  } catch (error) {
    console.warn('Unable to decode session', error)
    return null
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
}

function mergeWithFallback(source, fallback) {
  const merged = clone(fallback)
  if (!source || typeof source !== 'object') return merged
  if (!merged.assignments) merged.assignments = { byEmployee: {}, byClient: {} }

  if (source.assignments?.byEmployee) {
    for (const [employeeId, clientIds] of Object.entries(source.assignments.byEmployee)) {
      if (!Array.isArray(clientIds)) continue
      merged.assignments.byEmployee[employeeId] = Array.from(new Set(clientIds))
    }
  }

  if (source.assignments?.byClient) {
    for (const [clientId, employeeId] of Object.entries(source.assignments.byClient)) {
      if (typeof employeeId !== 'string') continue
      merged.assignments.byClient[clientId] = employeeId
    }
  }

  return merged
}
