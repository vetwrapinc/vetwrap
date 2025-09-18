import React from 'react'
import { Link } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { motion } from 'framer-motion'

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' }
]

export default function Navbar({ onLoginClick }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  
  const userRole = user?.publicMetadata?.role || 'client'
  const showDashboardLink = Boolean(user)

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-night/70 border-b border-white/5">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16" aria-label="Primary">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="flex items-center gap-3 focusable" aria-label="VetWraps home">
            <div className="w-8 h-8 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="vetwrapsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5fb7fa" />
                    <stop offset="100%" stopColor="#ffb26a" />
                  </linearGradient>
                </defs>
                <path
                  d="M20 20 L80 20 L80 40 L60 40 L60 60 L40 60 L40 40 L20 40 Z"
                  fill="url(#vetwrapsGradient)"
                  className="opacity-90"
                />
                <path
                  d="M30 30 L70 30 L70 50 L50 50 L50 70 L30 70 Z"
                  fill="rgba(255,255,255,0.3)"
                />
              </svg>
            </div>
            <span className="text-sm tracking-wider uppercase opacity-90 font-semibold">VetWraps</span>
          </Link>
        </motion.div>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item, index) => (
            <motion.a
              key={item.label}
              href={item.href}
              className="text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white focusable transition-colors"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item.label}
            </motion.a>
          ))}
          {showDashboardLink ? (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  to={`/${userRole}`}
                  className="text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white focusable transition-colors"
                >
                  Dashboard
                </Link>
              </motion.div>
              {user && (
                <motion.button
                  type="button"
                  onClick={() => signOut()}
                  className="text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-white focusable transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log Out
                </motion.button>
              )}
            </>
          ) : isLoaded ? (
            <motion.button
              type="button"
              onClick={onLoginClick}
              className="text-[11px] tracking-[0.2em] uppercase text-white/70 hover:text-white focusable transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              Log In
            </motion.button>
          ) : null}
          {!showDashboardLink && !user && !isLoaded && (
            <span className="text-[11px] tracking-[0.2em] uppercase text-white/60">Loading…</span>
          )}
          <motion.a
            href="#contact"
            className="text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            Start Project
          </motion.a>
        </div>
        <div className="md:hidden">
          <details>
            <summary 
              className="list-none text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10 cursor-pointer"
              aria-expanded="false"
              aria-controls="mobile-menu"
            >
              Menu
            </summary>
            <motion.div
              id="mobile-menu"
              className="absolute right-4 mt-2 w-48 glass rounded p-2 border border-glass"
              role="menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="block px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded">
                  {item.label}
                </a>
              ))}
              {showDashboardLink ? (
                <>
                  <Link to={`/${userRole}`} className="block px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded">
                    Dashboard
                  </Link>
                  {user && (
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-sm text-black/70 hover:bg-white/10 rounded"
                    >
                      Log Out
                    </button>
                  )}
                </>
              ) : isLoaded ? (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="w-full text-left px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded"
                >
                  Log In
                </button>
              ) : (
                <span className="block px-3 py-2 text-sm text-black/60">Loading…</span>
              )}
              <a href="#contact" className="block px-3 py-2 text-sm text-black/85 hover:bg-white/10 rounded">Start Project</a>
            </motion.div>
          </details>
        </div>
      </nav>
    </header>
  )
}

