import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' }
]

function createScrollAnimator() {
  const duration = 900
  return (target) => {
    if (!target) return
    const startY = window.scrollY
    const offset = 80
    const endY = target.getBoundingClientRect().top + window.scrollY - offset
    const delta = endY - startY
    const amplitude = delta * 0.08
    const startTime = performance.now()

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const wobble = Math.sin(progress * Math.PI * 1.6) * amplitude * (1 - progress)
      window.scrollTo({ top: startY + delta * eased + wobble, behavior: 'auto' })
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }
}

export default function Navbar({ onLoginClick }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const location = useLocation()
  const mobileMenuRef = React.useRef(null)
  const animateScroll = React.useMemo(() => createScrollAnimator(), [])

  const userRole = user?.publicMetadata?.role || 'client'
  const showDashboardLink = Boolean(user)

  const handleNavInteraction = (href, closeMenu = false) => (event) => {
    event.preventDefault()
    const target = document.querySelector(href)
    if (target) animateScroll(target)
    if (closeMenu && mobileMenuRef.current) {
      mobileMenuRef.current.open = false
    }
  }

  const handleMobileLogin = (event) => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false
    onLoginClick(event)
  }

  const renderNavButton = (item, index) => (
    <motion.button
      key={item.label}
      type="button"
      onClick={handleNavInteraction(item.href)}
      className="text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white focusable transition-colors"
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {item.label}
    </motion.button>
  )

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-night/70 border-b border-white/5">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16" aria-label="Primary">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="flex items-center gap-3 focusable" aria-label="VetWraps home">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-accent-blue via-white/35 to-accent-amber border border-white/30 shadow-[0_8px_24px_rgba(20,20,35,0.35)] overflow-hidden">
              <span className="text-night font-semibold text-lg tracking-[0.18em]">VP</span>
            </div>
            <span className="text-sm tracking-[0.35em] uppercase text-white/90 font-semibold">VetWraps</span>
          </Link>
        </motion.div>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(renderNavButton)}
          {showDashboardLink ? (
            <>
              <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 }}>
                <Link
                  to={`/${userRole}`}
                  state={{ from: location.pathname + location.hash }}
                  className="text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white focusable transition-colors"
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.button
                type="button"
                onClick={() => signOut()}
                className="text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-white focusable transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Log Out
              </motion.button>
            </>
          ) : isLoaded ? (
            <motion.button
              type="button"
              onClick={onLoginClick}
              className="text-[11px] tracking-[0.2em] uppercase text-white/70 hover:text-white focusable transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
            >
              Log In
            </motion.button>
          ) : null}
          <motion.button
            type="button"
            onClick={handleNavInteraction('#contact')}
            className="text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55 }}
          >
            Start Project
          </motion.button>
        </div>
        <div className="md:hidden">
          <details ref={mobileMenuRef}>
            <summary
              className="list-none text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10 cursor-pointer"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              Menu
            </summary>
            <motion.div
              id="mobile-menu"
              className="absolute right-4 mt-2 w-56 glass rounded-xl p-3 border border-glass space-y-1"
              role="menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={handleNavInteraction(item.href, true)}
                  className="block w-full text-left px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded"
                >
                  {item.label}
                </button>
              ))}
              {showDashboardLink ? (
                <>
                  <Link
                    to={`/${userRole}`}
                    state={{ from: location.pathname + location.hash }}
                    className="block px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded"
                    onClick={() => {
                      if (mobileMenuRef.current) mobileMenuRef.current.open = false
                    }}
                  >
                    Dashboard
                  </Link>
                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        signOut()
                        if (mobileMenuRef.current) mobileMenuRef.current.open = false
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-black/70 hover:bg-white/10 rounded"
                    >
                      Log Out
                    </button>
                  )}
                </>
              ) : isLoaded ? (
                <button
                  type="button"
                  onClick={handleMobileLogin}
                  className="w-full text-left px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded"
                >
                  Log In
                </button>
              ) : (
                <span className="block px-3 py-2 text-sm text-black/60">Loading</span>
              )}
              <button
                type="button"
                onClick={handleNavInteraction('#contact', true)}
                className="block w-full text-left px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded"
              >
                Start Project
              </button>
            </motion.div>
          </details>
        </div>
      </nav>
    </header>
  )
}
