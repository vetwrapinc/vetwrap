import React from 'react'
import { ShieldCheck, Timer, Wallet } from 'lucide-react'

const badges = [
  { label: 'Veteran-Owned', Icon: ShieldCheck, desc: 'Discipline, integrity, and service-first values.' },
  { label: '5–10 Day Turnaround', Icon: Timer, desc: 'Faster cycles; rush option available.' },
  { label: 'Transparent Pricing', Icon: Wallet, desc: 'Clarity up-front. No surprises.' }
]

export default function WhyUs() {
  return (
    <section id="why-us" aria-labelledby="why-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="why-title" className="text-2xl sm:text-3xl font-semibold tracking-tight mb-10">Why VetWraps</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {badges.map(({ label, Icon, desc }) => (
            <div key={label} className="rounded-xl glass border border-glass p-6">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 grid place-items-center rounded-md bg-white/10 border border-white/10">
                  <Icon className="text-accent-amber" size={18} aria-hidden="true" />
                </span>
                <h3 className="font-semibold tracking-tight">{label}</h3>
              </div>
              <p className="mt-3 text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-sm text-white/70">
          <p>
            VetWrap Inc represents discipline, precision, and creativity with impact. We value service before self (10% of profits support veterans overseas), excellence in execution, and adaptability. Clients aren’t just customers-they’re partners on a mission.
          </p>
        </div>
      </div>
    </section>
  )
}

