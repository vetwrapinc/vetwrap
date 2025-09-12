import React from 'react'
import { useParams, Link } from 'react-router-dom'

export default function CaseStudy() {
  const { slug } = useParams()
  return (
    <div className="min-h-screen bg-night text-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link to="/case-studies" className="text-sm text-white/70 hover:text-white">← Back</Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-3">{slug?.replace(/-/g, ' ')}</h1>
        <p className="text-white/70 mt-2">Full case study coming soon.</p>
        <div className="mt-6 rounded-xl glass border border-glass p-6">
          <p className="text-sm text-white/80">We’ll document strategy, exploration, iterations, and final deliverables here.</p>
        </div>
      </div>
    </div>
  )
}

