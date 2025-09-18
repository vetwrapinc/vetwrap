import React from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'

export default function CaseStudy() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const handleBack = () => {
    const previous = location.state && location.state.from
    if (previous) {
      navigate(previous)
    } else {
      navigate('/case-studies', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <title>{`${titleCase(slug)} - Case Study - VetWraps`}</title>
        <meta name="description" content="Process, iterations, and disciplined execution showcased in our case studies." />
        <link rel="canonical" href={`https://vetwraps.com/case-studies/${slug}`} />
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-6">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{titleCase(slug)}</h1>
          <p className="text-white/70 mt-2">Full case study coming soon.</p>
        </div>
        <div className="rounded-xl glass border border-glass p-6">
          <p className="text-sm text-white/80">We will document strategy, exploration, iterations, and final deliverables here.</p>
        </div>
      </div>
    </div>
  )
}

function titleCase(s = '') {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase())
}
