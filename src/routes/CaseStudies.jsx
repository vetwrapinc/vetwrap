import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'

const cases = [
  { slug: 'precision-esports', title: 'Precision Esports', summary: 'Identity and motion system' },
  { slug: 'northline-logistics', title: 'Northline Logistics', summary: 'Logomark + visual language' }
]

export default function CaseStudies() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleBack = () => {
    const previous = location.state && location.state.from
    if (previous) {
      navigate(previous)
    } else {
      navigate('/#portfolio')
    }
  }

  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <title>Case Studies - VetWraps</title>
        <meta name="description" content="Deep dives into our disciplined, high-impact design process." />
        <link rel="canonical" href="https://vetwraps.com/case-studies" />
      </Helmet>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Case Studies</h1>
          <p className="text-white/70 mt-2">Deep dives into process and execution. Coming soon.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {cases.map((c) => (
            <Link
              key={c.slug}
              to={`/case-studies/${c.slug}`}
              state={{ from: location.state?.from || location.pathname + location.search + location.hash }}
              className="rounded-xl glass border border-glass p-6 hover:shadow-glow transition-shadow"
            >
              <h2 className="font-semibold">{c.title}</h2>
              <p className="text-sm text-white/70 mt-1">{c.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
