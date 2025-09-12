import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function CaseStudy() {
  const { slug } = useParams()
  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <title>{`${titleCase(slug)} — Case Study — VetWraps`}</title>
        <meta name="description" content="Process, iterations, and disciplined execution showcased in our case studies." />
        <link rel="canonical" href={`https://vetwraps.com/case-studies/${slug}`} />
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <Link to="/case-studies" className="text-sm text-white/70 hover:text-white">← Back</Link>
        <h1 className="text-3xl font-semibold tracking-tight mt-3">{titleCase(slug)}</h1>
        <p className="text-white/70 mt-2">Full case study coming soon.</p>
        <div className="mt-6 rounded-xl glass border border-glass p-6">
          <p className="text-sm text-white/80">We’ll document strategy, exploration, iterations, and final deliverables here.</p>
        </div>
      </div>
    </div>
  )
}

function titleCase(s = '') {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
}
