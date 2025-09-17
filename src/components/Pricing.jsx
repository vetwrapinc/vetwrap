import React from 'react'
import Reveal from './Reveal'

const tiers = [
  {
    name: 'Basic Kit',
    price: '$400–$800',
    features: ['Logo or refresh', 'Basic brand sheet', '1–2 concepts, 1 revision'],
    cta: 'Start Basic'
  },
  {
    name: 'Advanced Identity',
    price: '$1,200–$1,800',
    features: ['Logo + system', 'Brand guidelines', 'Social pack, 2–3 concepts'],
    cta: 'Start Advanced',
    highlight: true
  },
  {
    name: 'Monthly Retainer',
    price: 'Subscription',
    subtitle: 'Prices vary — monthly billing',
    features: [
      'Up to 20 adjustments/month (web/logo/media; conditions apply)',
      'Two advertisements monthly',
      'Priority queue + strategy call'
    ],
    cta: 'Discuss Retainer'
  }
]

export default function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" id="pricing-title" className="text-2xl sm:text-3xl font-semibold tracking-tight mb-10">
          Pricing
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t, index) => (
            <Reveal
              key={t.name}
              as="article"
              delay={index * 0.08}
              className={`rounded-2xl glass border border-glass p-6 ${t.highlight ? 'shadow-glow' : ''}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-xl font-semibold">{t.name}</h3>
                <span className="text-accent-amber text-sm">{t.price}</span>
              </div>
              {t.subtitle && <p className="text-sm text-white/70 mt-1">{t.subtitle}</p>}
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-accent-blue" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a href="#contact" className="inline-flex mt-6 text-[11px] tracking-[0.2em] uppercase bg-white/10 hover:bg-white/20 px-3 py-2 rounded border border-white/10">{t.cta}</a>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" delay={0.32} className="text-sm text-white/60 mt-6">
          Rush option: +$400 (4–7 day turnaround).
        </Reveal>
      </div>
    </section>
  )
}

