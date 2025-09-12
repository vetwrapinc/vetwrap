import React from 'react'

const items = [
  { title: 'Precision Esports', tag: 'Brand System' },
  { title: 'Northline Logistics', tag: 'Logo' },
  { title: 'Echo Creator Pack', tag: 'Social Kit' },
  { title: 'Forward Ops', tag: 'Identity' }
]

export default function Portfolio() {
  return (
    <section id="portfolio" aria-labelledby="portfolio-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6 mb-10">
          <h2 id="portfolio-title" className="text-2xl sm:text-3xl font-semibold tracking-tight">Portfolio</h2>
          <p className="text-sm text-white/70 max-w-xl">Hover-tilt previews. Case studies coming soon.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <TiltCard key={item.title} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TiltCard({ title, tag }) {
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
    <article className="group perspective">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="tilt relative h-48 rounded-xl glass border border-glass p-4 transition-transform duration-150 will-change-transform"
        role="img"
        aria-label={`${title} mockup`}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-white/0" />
        <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-accent-blue/10 to-accent-amber/10" />
        <div className="relative h-full w-full grid grid-rows-3 gap-2">
          <div className="rounded-md bg-white/10 border border-white/10" />
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-md bg-white/10 border border-white/10" />
            <div className="rounded-md bg-white/10 border border-white/10" />
            <div className="rounded-md bg-white/10 border border-white/10" />
          </div>
          <div className="rounded-md bg-white/10 border border-white/10" />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <span className="font-medium">{title}</span>
          <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white/80">{tag}</span>
        </div>
      </div>
    </article>
  )
}

