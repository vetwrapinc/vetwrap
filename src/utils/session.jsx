import React from 'react'
import { authFetch, getPortalToken } from './api'

const SessionContext = React.createContext(null)

function parseError(res, fallback = 'Request failed') {
  if (!res) return fallback
  return res?.error || res?.message || fallback
}

export function SessionProvider({ children }) {
  const [status, setStatus] = React.useState('loading')
  const [user, setUser] = React.useState(null)
  const [data, setData] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [busy, setBusy] = React.useState(false)

  const applyPayload = React.useCallback((payload) => {
    if (!payload) {
      setData(null)
      return
    }
    const { user: payloadUser, ...rest } = payload
    if (payloadUser) setUser(payloadUser)
    setData(rest)
  }, [])

  const loadProfile = React.useCallback(
    async (token = getPortalToken()) => {
      if (!token) {
        setStatus('unauthenticated')
        setUser(null)
        setData(null)
        return
      }
      try {
        const res = await authFetch('/api/auth-me')
        if (!res.ok) {
          localStorage.removeItem('vetwraps_portal_token')
          localStorage.removeItem('vetwraps_admin_token')
          setStatus('unauthenticated')
          setUser(null)
          setData(null)
          return
        }
        const payload = await res.json()
        applyPayload(payload)
        setStatus('authenticated')
      } catch (err) {
        console.error('Failed to load session', err)
        setStatus('unauthenticated')
        setUser(null)
        setData(null)
      }
    },
    [applyPayload]
  )

  React.useEffect(() => {
    const token = getPortalToken()
    if (!token) {
      setStatus('unauthenticated')
      return
    }
    loadProfile(token)
  }, [loadProfile])

  const login = React.useCallback(async ({ email, password }) => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(parseError(payload, 'Login failed'))
      }
      const payload = await res.json()
      const token = payload.token
      if (!token) throw new Error('Missing token')
      localStorage.setItem('vetwraps_portal_token', token)
      if (payload.user?.role === 'admin') {
        localStorage.setItem('vetwraps_admin_token', token)
      } else {
        localStorage.removeItem('vetwraps_admin_token')
      }
      applyPayload(payload)
      setStatus('authenticated')
      await loadProfile(token)
      return payload.user
    } catch (err) {
      setStatus('unauthenticated')
      setError(err.message || 'Login failed')
      throw err
    } finally {
      setBusy(false)
    }
  }, [applyPayload, loadProfile])

  const logout = React.useCallback(() => {
    localStorage.removeItem('vetwraps_portal_token')
    localStorage.removeItem('vetwraps_admin_token')
    setUser(null)
    setData(null)
    setStatus('unauthenticated')
  }, [])

  const refresh = React.useCallback(async () => {
    await loadProfile()
  }, [loadProfile])

  const value = React.useMemo(
    () => ({
      status,
      user,
      data,
      error,
      setError,
      login,
      logout,
      refresh,
      busy,
    }),
    [status, user, data, error, login, logout, refresh, busy]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = React.useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
