import React from 'react'
import { Link } from 'react-router-dom'

const cases = [
  { slug: 'precision-esports', title: 'Precision Esports', summary: 'Identity and motion system' },
  { slug: 'northline-logistics', title: 'Northline Logistics', summary: 'Logomark + visual language' }
]

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-night text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Case Studies</h1>
        <p className="text-white/70 mt-2">Deep dives into process and execution. Coming soon.</p>
        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          {cases.map(c => (
            <Link key={c.slug} to={`/case-studies/${c.slug}`} className="rounded-xl glass border border-glass p-6 hover:shadow-glow transition-shadow">
              <h2 className="font-semibold">{c.title}</h2>
              <p className="text-sm text-white/70 mt-1">{c.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

