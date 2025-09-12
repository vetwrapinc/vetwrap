import React from 'react'

export function useIdentity() {
  const [ready, setReady] = React.useState(false)
  const [user, setUser] = React.useState(null)

  React.useEffect(() => {
    const widget = window.netlifyIdentity
    if (!widget) {
      setReady(true)
      return
    }
    const onInit = (u) => { setUser(u); setReady(true) }
    const onLogin = (u) => setUser(u)
    const onLogout = () => setUser(null)
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

  const login = React.useCallback(() => {
    window.netlifyIdentity?.open('login')
  }, [])

  const logout = React.useCallback(() => {
    window.netlifyIdentity?.logout()
  }, [])

  return { ready, user, login, logout }
}

