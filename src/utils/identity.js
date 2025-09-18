import React from 'react'
import { authFetch } from './api'

const defaultAccess = { checked: false, allowed: false, loading: false, grant: null, reason: '' }

export function useIdentity() {
  const [ready, setReady] = React.useState(false)
  const [user, setUser] = React.useState(null)
  const [access, setAccess] = React.useState(defaultAccess)
  const widgetRef = React.useRef(null)
  const refreshCounter = React.useRef(0)

  React.useEffect(() => {
    const widget = window.netlifyIdentity
    widgetRef.current = widget || null
    if (!widget) {
      setReady(true)
      return
    }
    const onInit = (u) => {
      setUser(u)
      setReady(true)
    }
    const onLogin = (u) => {
      setUser(u)
      widget.close?.()
    }
    const onLogout = () => {
      setUser(null)
      setAccess(defaultAccess)
    }
    widget.on('init', onInit)
    widget.on('login', onLogin)
    widget.on('logout', onLogout)
    widget.init()
    return () => {
      widget.off('init', onInit)
      widget.off('login', onLogin)
      widget.off('logout', onLogout)
    }
  }, [])

  const checkAccess = React.useCallback(async () => {
    if (!ready || !user) {
      setAccess((prev) => ({ ...defaultAccess, checked: ready }))
      return
    }
    const currentAttempt = ++refreshCounter.current
    setAccess((prev) => ({ ...prev, loading: true }))
    try {
      const res = await authFetch('/api/access-session')
      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }
      if (!res.ok) {
        throw new Error(data.error || 'Unable to verify access')
      }
      if (refreshCounter.current !== currentAttempt) return
      const allowed = Boolean(data.allowed)
      setAccess({
        checked: true,
        allowed,
        loading: false,
        grant: data.grant || null,
        reason: data.reason || (allowed ? '' : 'Access not granted')
      })
      if (!allowed) {
        widgetRef.current?.logout?.()
      }
    } catch (err) {
      if (refreshCounter.current !== currentAttempt) return
      setAccess({
        checked: true,
        allowed: false,
        loading: false,
        grant: null,
        reason: err.message || 'Unable to verify access'
      })
      widgetRef.current?.logout?.()
    }
  }, [ready, user])

  React.useEffect(() => {
    checkAccess()
  }, [checkAccess])

  const login = React.useCallback(() => {
    const widget = widgetRef.current
    if (!widget) {
      console.warn('Netlify Identity widget not available')
      return
    }
    try {
      widget.open('login')
    } catch (err) {
      console.error('Failed to open login widget:', err)
      // Could show user-friendly error message here
    }
  }, [])

  const logout = React.useCallback(() => {
    widgetRef.current?.logout?.()
  }, [])

  const refreshAccess = React.useCallback(() => {
    checkAccess()
  }, [checkAccess])

  const hasDashboardAccess = Boolean(access.allowed && user)

  return { ready, user, login, logout, access, refreshAccess, hasDashboardAccess }
}

