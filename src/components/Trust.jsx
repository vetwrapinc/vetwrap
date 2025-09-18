import React from 'react'

export default function Trust() {
  return (
    <section aria-labelledby="trust-title" className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="trust-title" className="text-sm uppercase tracking-[0.2em] text-white/60">Trust &amp; Social Proof</h2>
        <div className="mt-4 grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg glass border border-glass p-4 text-center">
            <p className="text-xs text-white/60">Veteran-Owned</p>
          </div>
          <div className="rounded-lg glass border border-glass p-4 text-center">
            <p className="text-xs text-white/60">Certifications - Coming soon</p>
          </div>
          <div className="rounded-lg glass border border-glass p-4 text-center">
            <p className="text-xs text-white/60">Partnerships - Coming soon</p>
          </div>
        </div>
      </div>
    </section>
  )
}
