import React from 'react'
import Reveal from './Reveal'

export default function Trust() {
  return (
    <section aria-labelledby="trust-title" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal as="h2" id="trust-title" className="text-sm uppercase tracking-[0.2em] text-white/60">
          Trust & Social Proof
        </Reveal>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          {[
            'Veteran-Owned',
            'Certifications — Coming soon',
            'Partnerships — Coming soon'
          ].map((label, index) => (
            <Reveal key={label} as="div" delay={index * 0.08} className="rounded-lg glass border border-glass p-4 text-center">
              <p className="text-xs text-white/60">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

