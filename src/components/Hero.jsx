import React from 'react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              id="hero-title" 
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span 
                className="block font-dmserif text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Mission-Ready Design.
              </motion.span>
              <motion.span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-amber"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Veteran Precision.
              </motion.span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-white/80 max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Veteran-owned digital design studio crafting logos, brand identity kits, social media packs, and monthly creative retainers. Discipline, precision, and creativity with impact.
            </motion.p>
            <motion.div 
              className="mt-8 flex items-center gap-4"
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
                className="text-white/80 hover:text-white text-sm underline underline-offset-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Work
              </motion.a>
            </motion.div>
          </motion.div>
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            {/* Orbital mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="relative aspect-[4/3] rounded-2xl glass border border-glass shadow-glow p-6 hover-lift"
            >
              <motion.div 
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-accent-blue/10 blur-2xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-accent-amber/10 blur-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              <div className="h-full w-full grid grid-rows-2 gap-3">
                <motion.div 
                  className="rounded-lg bg-white/5 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                />
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      className="rounded-lg bg-white/5 border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 + i * 0.1 }}
                    />
                  ))}
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
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.05)`
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
        className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-blue/20 to-accent-amber/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scale: 0.8, opacity: 0 }}
        whileHover={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.span 
        className="relative z-10"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  )
}

