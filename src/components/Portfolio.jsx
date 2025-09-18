import React, { useState, useRef, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import ImageModal from './ImageModal'
import { useDashboard } from '../context/DashboardContext'



export default function Portfolio() {
  const [selectedImage, setSelectedImage] = useState(null)
  const { state } = useDashboard()
  const projects = useMemo(() => {
    return state.portfolio.map((item) => {
      const imageSrc = item.image || '/images/iron-grind-coffee.png'
      const aspectRatio = item.aspectRatio || 1200 / 800
      return {
        id: item.id,
        title: item.title,
        tag: item.tag || 'Showcase',
        image: {
          src: imageSrc,
          srcSet: `${imageSrc} 1x, ${imageSrc} 2x`,
          sizes: '(min-width: 1024px) 540px, 92vw',
          alt: item.description || item.title,
          aspectRatio
        },
        description: item.description || ''
      }
    })
  }, [state.portfolio])

  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.5 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Live Operations</p>
            <h2 id="portfolio-title" className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              Portfolio Signals
            </h2>
          </div>
          <p className="text-sm text-white/70 max-w-xl">
            Swipe through the collaged mission boards. Every tile reveals layered lighting passes, orbital glyphs, and hand tuned textures captured from our production floor.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/20 p-12 text-center text-white/60">
              Portfolio items will appear once the admin adds them.
            </div>
          ) : (
            projects.map((project, index) => (
              <HologramCard
                key={project.id || project.title}
                project={project}
                index={index}
                onOpen={() => setSelectedImage(project)}
              />
            ))
          )}
        </div>

        <ImageModal
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          image={selectedImage?.image}
          title={selectedImage?.title}
          description={selectedImage?.description}
        />
      </div>
    </section>
  )
}

function HologramCard({ project, index, onOpen }) {
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-50, 50], [15, -15]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-50, 50], [-15, 15]), { stiffness: 200, damping: 20 })
  const glare = useSpring(useTransform(x, [-60, 60], [0, 1]), { stiffness: 120, damping: 18 })

  const handleMove = (event) => {
    const element = cardRef.current
    if (!element) return
    const rect = element.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - rect.width / 2
    const offsetY = event.clientY - rect.top - rect.height / 2
    x.set(offsetX)
    y.set(offsetY)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.article
      className="group relative"
      ref={cardRef}
      style={{ rotateX, rotateY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      viewport={{ once: true, amount: 0.4 }}
    >
      <motion.div
        className="relative h-[22rem] rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm cursor-pointer"
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onOpen}
      >
        <motion.img
          src={project.image.src}
          srcSet={project.image.srcSet}
          sizes={project.image.sizes}
          alt={project.image.alt}
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
          loading="lazy"
          style={{ aspectRatio: project.image.aspectRatio }}
          initial={{ scale: 1.06 }}
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/40"
          style={{ opacity: glare }}
        />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <motion.span
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80"
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            {project.tag}
          </motion.span>
          <motion.h3
            className="mt-4 text-2xl font-semibold"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 + index * 0.1 }}
          >
            {project.title}
          </motion.h3>
          <motion.p
            className="mt-3 text-sm text-white/75"
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 + index * 0.1 }}
          >
            {project.description}
          </motion.p>
          <motion.div
            className="mt-6 flex items-center text-xs uppercase tracking-[0.3em] text-white/60"
            initial={{ y: 26, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.32 + index * 0.1 }}
          >
            Open Detail Capsule
            <motion.svg
              className="ml-3 h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </motion.svg>
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10 opacity-0 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
    </motion.article>
  )
}
