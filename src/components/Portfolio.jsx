import React, { useState } from 'react'
import { motion } from 'framer-motion'
import ImageModal from './ImageModal'

const items = [
  { 
    title: 'Iron Grind Coffee', 
    tag: 'Brand Identity',
    image: '/images/iron-grind-coffee.jpg',
    description: 'Complete branding system for a premium coffee shop featuring minimalist design with black and off-white color palette, including disposable cups, wall signage, and menu design.'
  },
  { 
    title: 'Sentinel Home Systems', 
    tag: 'Tech Branding',
    image: '/images/sentinel-home-systems.jpg',
    description: 'Futuristic branding for a smart home security company with dark, tech-themed design featuring circuit board aesthetics and modern security product visualization.'
  }
]

export default function Portfolio() {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex items-end justify-between gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 id="portfolio-title" className="text-2xl sm:text-3xl font-semibold tracking-tight">Portfolio</h2>
          <p className="text-sm text-white/70 max-w-xl">Click on any project to view details and see our capabilities.</p>
        </motion.div>
        <motion.div 
          className="grid sm:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {items.map((item, index) => (
            <TiltCard 
              key={item.title} 
              {...item} 
              index={index}
              onClick={() => setSelectedImage(item)}
            />
          ))}
        </motion.div>
        
        <ImageModal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage?.image}
          title={selectedImage?.title}
          description={selectedImage?.description}
        />
      </div>
    </section>
  )
}

function TiltCard({ title, tag, image, description, index, onClick }) {
  const ref = React.useRef(null)
  
  function onMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = x / rect.width - 0.5
    const py = y / rect.height - 0.5
    el.style.transform = `rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`
  }
  
  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'rotateX(0) rotateY(0)'
  }
  
  return (
    <motion.article 
      className="group perspective cursor-pointer"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick}
        className="tilt relative h-80 rounded-2xl glass border border-glass overflow-hidden transition-all duration-300 will-change-transform group-hover:shadow-2xl group-hover:shadow-accent-blue/20"
        role="img"
        aria-label={`${title} project preview`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
        <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-accent-blue/20 to-accent-amber/20" />
        
        {/* Project Image */}
        <div className="relative h-full w-full">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-2xl"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
        
        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center justify-between mb-3"
          >
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium">
              {tag}
            </span>
          </motion.div>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="text-white/80 text-sm leading-relaxed mb-4"
          >
            {description}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-2 text-white/70 text-sm"
          >
            <span>Click to view details</span>
            <motion.svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}

