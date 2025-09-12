import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid md:grid-cols-3 gap-6 items-start">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 grid place-items-center">
              <span className="text-accent-blue font-bold">V</span>
            </div>
            <span className="text-sm tracking-wider uppercase opacity-90">VetWraps</span>
          </div>
          <p className="mt-4 text-sm text-white/70 max-w-sm">Sleek, bold, and forward-looking design. Grounded in integrity and service.</p>
        </div>
        <nav className="text-sm flex gap-6" aria-label="Footer">
          <ul className="space-y-2 text-white/80">
            <li><a href="#services" className="hover:text-white">Services</a></li>
            <li><a href="#portfolio" className="hover:text-white">Portfolio</a></li>
            <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="#contact" className="hover:text-white">Contact</a></li>
          </ul>
          <ul className="space-y-2 text-white/80">
            <li><Link to="/case-studies" className="hover:text-white">Case Studies</Link></li>
            <li><Link to="/whats-new" className="hover:text-white">What’s New?</Link></li>
            <li><a href="mailto:vetwrapinc@gmail.com" className="hover:text-white">vetwrapinc@gmail.com</a></li>
          </ul>
        </nav>
        <div className="text-sm text-white/60">
          <p>2025 Vetwraps. Veteran-owned creative agency.</p>
        </div>
      </div>
    </footer>
  )
}

