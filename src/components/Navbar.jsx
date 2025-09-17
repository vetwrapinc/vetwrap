import React from 'react'
import { Link } from 'react-router-dom'
import { useIdentity } from '../utils/identity'

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' }
]

export default function Navbar() {
  const { user, login, logout, ready, hasDashboardAccess } = useIdentity()
  const [hasAdminToken, setHasAdminToken] = React.useState(false)

  React.useEffect(() => {
    function syncToken() {
      try {
        const token = localStorage.getItem('vetwraps_admin_token')
        setHasAdminToken(Boolean(token))
      } catch {
        setHasAdminToken(false)
      }
    }
    syncToken()
    window.addEventListener('storage', syncToken)
    window.addEventListener('focus', syncToken)
    return () => {
      window.removeEventListener('storage', syncToken)
      window.removeEventListener('focus', syncToken)
    }
  }, [])

  const showDashboardLink = hasDashboardAccess || hasAdminToken

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-night/70 border-b border-white/5">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16" aria-label="Primary">
        <Link to="/" className="flex items-center gap-2 focusable" aria-label="VetWraps home">
          <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 grid place-items-center shadow-innerGlow">
            <span className="text-accent-blue font-bold">V</span>
          </div>
          <span className="text-sm tracking-wider uppercase opacity-90">VetWraps</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white focusable transition-colors">
              {item.label}
            </a>
          ))}
          {showDashboardLink ? (
            <>
              <Link
                to="/subscribers"
                className="text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white focusable transition-colors"
              >
                Dashboard
              </Link>
              {user && (
                <button
                  type="button"
                  onClick={logout}
                  className="text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-white focusable transition-colors"
                >
                  Log Out
                </button>
              )}
            </>
          ) : ready ? (
            <button
              type="button"
              onClick={login}
              className="text-[11px] tracking-[0.2em] uppercase text-white/70 hover:text-white focusable transition-colors"
            >
              Log In
            </button>
          ) : null}
          {!showDashboardLink && !user && !ready && (
            <span className="text-[11px] tracking-[0.2em] uppercase text-white/60">Loading…</span>
          )}
          <a href="#contact" className="text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10">
            Start Project
          </a>
        </div>
        <div className="md:hidden">
          <details>
            <summary className="list-none text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10 cursor-pointer">Menu</summary>
            <div className="absolute right-4 mt-2 w-48 glass rounded p-2 border border-glass">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="block px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded">
                  {item.label}
                </a>
              ))}
              {showDashboardLink ? (
                <>
                  <Link to="/subscribers" className="block px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded">
                    Dashboard
                  </Link>
                  {user && (
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/10 rounded"
                    >
                      Log Out
                    </button>
                  )}
                </>
              ) : ready ? (
                <button
                  type="button"
                  onClick={login}
                  className="w-full text-left px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded"
                >
                  Log In
                </button>
              ) : (
                <span className="block px-3 py-2 text-sm text-white/60">Loading…</span>
              )}
              <a href="#contact" className="block px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded">Start Project</a>
            </div>
          </details>
        </div>
      </nav>
    </header>
  )
}

