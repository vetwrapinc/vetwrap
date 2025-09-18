import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brush, BadgeCheck, Layers, Share2 } from 'lucide-react'

const services = [
  {
    title: 'Logo Design',
    Icon: Brush,
    desc: 'Sharp, memorable marks built for versatile deployment across mission touchpoints.',
    slug: 'logo-design'
  },
  {
    title: 'Brand Identity Kits',
    Icon: Layers,
    desc: 'Color theory, typography stacks, and deployment playbooks assembled for cohesion.',
    slug: 'brand-identity-kits'
  },
  {
    title: 'Social Media Packs',
    Icon: Share2,
    desc: 'Template libraries, real time content prompts, and adaptive overlays for high-signal presence.',
    slug: 'social-media-packs'
  },
  {
    title: 'Monthly Retainers',
    Icon: BadgeCheck,
    desc: 'Rapid response creative support with scheduled audits, KPI reviews, and artifacts on demand.',
    slug: 'monthly-retainers'
  }
]

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
      duration: 0.7
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 26, rotateX: 6 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: 'spring', stiffness: 140, damping: 16 }
  }
}

export default function Services() {
  const location = useLocation()

  return (
    <section id="services" aria-labelledby="services-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/60">Capabilities</p>
            <h2 id="services-title" className="mt-3 text-3xl font-semibold tracking-tight">
              Mission Services
            </h2>
          </div>
          <p className="text-sm text-white/70 max-w-xl">
            Each engagement runs inside our live production pipeline with audit trails, handoff packets, and automated AI recaps for every milestone.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {services.map(({ title, Icon, desc, slug }, index) => (
            <motion.article
              key={title}
              variants={cardVariants}
              className="group relative rounded-2xl glass border border-white/10 overflow-hidden"
              whileHover={{ translateY: -6 }}
            >
              <Link
                to={`/services/${slug}`}
                state={{ from: location.pathname + location.hash, title }}
                className="flex h-full flex-col p-6 focusable"
              >
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ backgroundImage: 'linear-gradient(120deg, rgba(95,183,250,0.14), rgba(255,178,106,0.14))', backgroundSize: '200% 200%' }}
                />
                <div className="relative flex flex-col gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/12 border border-white/20 grid place-items-center">
                    <Icon className="text-accent-blue" size={20} aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold tracking-tight text-lg">{title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{desc}</p>
                  <span className="mt-auto inline-flex items-center text-xs uppercase tracking-[0.35em] text-white/70">
                    Discover Potential
                    <motion.svg
                      className="ml-2 h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.6, delay: index * 0.05 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
