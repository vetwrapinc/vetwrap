import React from 'react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="block font-dmserif text-white">Mission-Ready Design.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-amber">Veteran Precision.</span>
            </h1>
            <p className="mt-6 text-white/80 max-w-xl">
              Veteran-owned digital design studio crafting logos, brand identity kits, social media packs, and monthly creative retainers. Discipline, precision, and creativity with impact.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a href="#contact" className="magnetic-area">
                <MagneticButton>
                  Start a Quote
                </MagneticButton>
              </a>
              <a href="#portfolio" className="text-white/80 hover:text-white text-sm underline underline-offset-4">View Work</a>
            </div>
          </div>
          <div className="relative">
            {/* Orbital mockup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative aspect-[4/3] rounded-2xl glass border border-glass shadow-glow p-6"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-accent-blue/10 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-accent-amber/10 blur-2xl" />
              <div className="h-full w-full grid grid-rows-2 gap-3">
                <div className="rounded-lg bg-white/5 border border-white/10" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-white/5 border border-white/10" />
                  <div className="rounded-lg bg-white/5 border border-white/10" />
                  <div className="rounded-lg bg-white/5 border border-white/10" />
                </div>
              </div>
              {/* Orbital ring */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="absolute -inset-6" viewBox="0 0 400 300" fill="none">
                  <ellipse cx="200" cy="150" rx="180" ry="130" stroke="rgba(95,183,250,0.35)" strokeDasharray="6 8" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MagneticButton({ children }) {
  const ref = React.useRef(null)
  function onMouseMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`
  }
  function onMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0,0)'
  }
  return (
    <button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white/10 border border-white/15 hover:border-accent-blue/50 hover:shadow-glow transition-colors text-sm tracking-widest uppercase"
    >
      <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-blue/20 to-accent-amber/20 opacity-0 hover:opacity-100 transition-opacity" />
      <span className="relative">{children}</span>
    </button>
  )
}

