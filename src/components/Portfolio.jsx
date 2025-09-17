import React from 'react'
import ironGrindImage from '../assets/portfolio/iron-grind.base64?raw'
import sentinelImage from '../assets/portfolio/sentinel-home.base64?raw'
import Reveal from './Reveal'

const items = [
  {
    title: 'Iron Grind Coffee',
    tag: 'Brand System',
    image: `data:image/png;base64,${ironGrindImage}`,
    width: 1200,
    height: 800,
    alt: 'Iron Grind Coffee signage, takeaway cup, and menu mockup'
  },
  {
    title: 'Sentinel Home Systems',
    tag: 'Product Launch',
    image: `data:image/png;base64,${sentinelImage}`,
    width: 1200,
    height: 800,
    alt: 'Sentinel Home Systems smart security landing mockup'
  }
]

export default function Portfolio() {
  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal as="div" className="flex items-end justify-between gap-6 mb-10">
          <h2 id="portfolio-title" className="text-2xl sm:text-3xl font-semibold tracking-tight">Portfolio</h2>
          <p className="text-sm text-white/70 max-w-xl">Hover-tilt previews. Case studies coming soon.</p>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-8">
          {items.map((item, index) => (
            <TiltCard key={item.title} index={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TiltCard({ title, tag, index, image, alt, width, height }) {
  const ref = React.useRef(null)
  function onMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = x / rect.width - 0.5
    const py = y / rect.height - 0.5
    el.style.transform = `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`
  }
  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'rotateX(0) rotateY(0)'
  }
  return (
    <Reveal as="article" delay={index * 0.08} className="group perspective">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="tilt relative aspect-[3/2] rounded-xl glass border border-glass p-4 transition-transform duration-150 will-change-transform"
        role={image ? undefined : 'img'}
        aria-label={image ? undefined : `${title} mockup`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-white/0" />
        <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-accent-blue/10 to-accent-amber/10" />
        {image ? (
          <>
            <img
              src={image}
              alt={alt ?? `${title} case study visual`}
              width={width}
              height={height}
              className="absolute inset-0 h-full w-full rounded-xl object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="relative h-full w-full grid grid-rows-3 gap-2">
            <div className="rounded-md bg-white/10 border border-white/10" />
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md bg-white/10 border border-white/10" />
              <div className="rounded-md bg-white/10 border border-white/10" />
              <div className="rounded-md bg-white/10 border border-white/10" />
            </div>
            <div className="rounded-md bg-white/10 border border-white/10" />
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs">
          <span className="font-medium">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white/80">{tag}</span>
        </div>
      </div>
    </Reveal>
  )
}

