import React from 'react'
import { Brush, BadgeCheck, Layers, Share2 } from 'lucide-react'
import Reveal from './Reveal'

const services = [
  {
    title: 'Logo Design',
    Icon: Brush,
    desc: 'Sharp, memorable marks built for versatility and impact.'
  },
  {
    title: 'Brand Identity Kits',
    Icon: Layers,
    desc: 'Color, typography, usage, and brand systems for cohesion.'
  },
  {
    title: 'Social Media Packs',
    Icon: Share2,
    desc: 'Templates and post kits for consistent, high-signal presence.'
  },
  {
    title: 'Monthly Retainers',
    Icon: BadgeCheck,
    desc: 'On-call creative support. Flexible, disciplined execution.'
  }
]

export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal as="div" className="flex items-end justify-between gap-6 mb-10">
          <h2 id="services-title" className="text-2xl sm:text-3xl font-semibold tracking-tight">Services</h2>
          <p className="text-sm text-white/70 max-w-xl">
            Apple-level minimalism, veteran-grade precision. Design systems that scale cleanly across platforms.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ title, Icon, desc }, index) => (
            <Reveal
              key={title}
              as="article"
              delay={index * 0.08}
              className="group relative rounded-xl glass border border-glass p-5 hover:shadow-glow transition-shadow"
              aria-label={title}
            >
              <div className="w-10 h-10 rounded-lg bg-white/8 border border-white/10 grid place-items-center mb-4 group-hover:shadow-glow">
                <Icon className="text-accent-blue" size={20} aria-hidden="true" />
              </div>
              <h3 className="font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm text-white/70">{desc}</p>
              <div aria-hidden className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-accent-blue/10 to-accent-amber/10" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

