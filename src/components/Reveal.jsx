import React from 'react'
import { motion } from 'framer-motion'

export default function Reveal({ as = 'div', delay = 0, className, children, ...rest }) {
  const MotionComponent = React.useMemo(() => motion(as), [as])

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
      {...rest}
    >
      {children}
    </MotionComponent>
  )
}
