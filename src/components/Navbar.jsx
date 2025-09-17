import React from 'react'
import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Services', hash: 'services' },
  { label: 'Why Us', hash: 'why-us' },
  { label: 'Portfolio', hash: 'portfolio' },
  { label: 'Pricing', hash: 'pricing' },
  { label: 'Contact', hash: 'contact' }
]

export default function Navbar() {
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
            <a
              key={item.label}
              href={`/#${item.hash}`}
              className="text-[11px] tracking-[0.2em] uppercase text-white/80 hover:text-white focusable transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/portal"
            className="text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10"
          >
            Portal Login
          </Link>
          <a href="/#contact" className="text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10">
            Start Project
          </a>
        </div>
        <div className="md:hidden">
          <details>
            <summary className="list-none text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded focusable border border-white/10 cursor-pointer">Menu</summary>
            <div className="absolute right-4 mt-2 w-48 glass rounded p-2 border border-glass">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={`/#${item.hash}`}
                  className="block px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded"
                >
                  {item.label}
                </a>
              ))}
              <Link to="/portal" className="block px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded">Portal Login</Link>
              <a href="/#contact" className="block px-3 py-2 text-sm text-white/85 hover:bg-white/10 rounded">Start Project</a>
            </div>
          </details>
        </div>
      </nav>
    </header>
  )
}

