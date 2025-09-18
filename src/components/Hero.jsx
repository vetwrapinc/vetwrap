import React from 'react'
import { motion } from 'framer-motion'

const collageImages = [
  {
    src: '/images/image-1200x794.png',
    alt: 'Orbital brand theater collage',
    className: 'shadow-[0_20px_40px_rgba(10,10,18,0.55)]'
  },
  {
    src: '/images/image-1200x800.png',
    alt: 'Precision interface suite collage',
    className: 'shadow-[0_14px_28px_rgba(12,18,30,0.45)]'
  }
]

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <p className="text-xs uppercase tracking-[0.45em] text-white/60">
                Veteran Owned Studio
              </p>
              <motion.h1
                id="hero-title"
                className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight space-y-2"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="block font-dmserif text-white">
                  Mission-Ready Design.
                </span>
                <motion.span
                  className="inline-flex rounded-full px-4 py-1 font-dmserif text-transparent bg-clip-text hero-gradient-text"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], letterSpacing: ['0.02em', '0.08em', '0.02em'] }}
                  transition={{ duration: 6, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Veteran Precision.
                </motion.span>
              </motion.h1>
              <motion.p
                className="mt-7 text-white/80 max-w-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                We architect brand systems, launch-ready collateral, and continuously evolving social packs for teams that expect military grade precision paired with imaginative craftsmanship.
              </motion.p>
              <motion.div
                className="mt-10 flex items-center gap-4 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <a href="#contact" className="magnetic-area">
                  <MagneticButton>
                    Start a Quote
                  </MagneticButton>
                </a>
                <motion.a
                  href="#portfolio"
                  className="text-white/75 hover:text-white text-sm uppercase tracking-[0.3em]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Work
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              className="relative"
              animate={{ rotateZ: [0, 1.8, -1.2, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute -inset-12 bg-radial-accent" aria-hidden="true" />
              <div className="grid gap-6">
                <motion.div
                  className="relative rounded-[36px] overflow-hidden border border-white/10 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
                >
                  <motion.img
                    src={collageImages[0].src}
                    alt={collageImages[0].alt}
                    className={`w-full object-cover ${collageImages[0].className}`}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: [1.05, 1.1, 1.05] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 mix-blend-screen opacity-60"
                    animate={{ background: [
                      'radial-gradient(600px at 20% 20%, rgba(95,183,250,0.25), transparent)',
                      'radial-gradient(600px at 80% 40%, rgba(255,178,106,0.25), transparent)',
                      'radial-gradient(600px at 20% 20%, rgba(95,183,250,0.25), transparent)'
                    ] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
                <motion.div
                  className="relative ml-auto w-4/5 rounded-[28px] overflow-hidden border border-white/10 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.7, ease: 'easeOut' }}
                >
                  <motion.img
                    src={collageImages[1].src}
                    alt={collageImages[1].alt}
                    className={`w-full object-cover ${collageImages[1].className}`}
                    initial={{ scale: 1.08 }}
                    animate={{ scale: [1.08, 1.02, 1.08] }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/50"
                    animate={{ opacity: [0.4, 0.25, 0.4] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>
              <motion.div
                className="pointer-events-none absolute inset-0"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              >
                <svg className="absolute -inset-10" viewBox="0 0 600 600" fill="none">
                  <circle cx="300" cy="300" r="280" stroke="rgba(95,183,250,0.25)" strokeDasharray="10 12" />
                  <circle cx="300" cy="300" r="220" stroke="rgba(255,178,106,0.18)" strokeDasharray="8 18" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
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
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${offsetX * 0.18}px, ${offsetY * 0.18}px) scale(1.05)`
  }

  function onMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translate(0,0) scale(1)'
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative inline-flex items-center justify-center px-6 py-4 rounded-lg bg-white/10 border border-white/15 hover:border-accent-blue/50 hover:shadow-glow transition-all duration-300 text-sm tracking-widest uppercase overflow-hidden group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
    >
      <motion.span
        className="absolute inset-0 rounded-lg hero-gradient opacity-60 group-hover:opacity-100"
        initial={{ scale: 0.85, opacity: 0 }}
        whileHover={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.span
        className="relative z-10"
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        initial={{ x: '-120%' }}
        whileHover={{ x: '120%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  )
}
