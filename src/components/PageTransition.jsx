import React from 'react'
import { motion } from 'framer-motion'

const transition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1]
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      className="page-transition-frame"
      initial={{ opacity: 0, filter: 'blur(18px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(18px)' }}
      transition={transition}
      style={{ willChange: 'opacity, filter' }}
    >
      {children}
    </motion.div>
  )
}
