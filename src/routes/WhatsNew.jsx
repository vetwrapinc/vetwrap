import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft } from 'lucide-react'

const posts = [
  { title: 'Studio Update', date: '2025-01-02', summary: 'Operational improvements and new retainers.' },
  { title: 'Giving Back', date: '2025-02-15', summary: 'Ten percent of profits supporting veterans overseas.' }
]

export default function WhatsNew() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleBack = () => {
    const previous = location.state && location.state.from
    if (previous) {
      navigate(previous)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <title>Whats New - VetWraps</title>
        <meta name="description" content="Updates, operational improvements, and ways we support veterans overseas." />
        <link rel="canonical" href="https://vetwraps.com/whats-new" />
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 space-y-8">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Whats New</h1>
          <p className="text-white/70 mt-2">Updates, announcements, and insights.</p>
        </div>
        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p.title} className="rounded-xl glass border border-glass p-6">
              <h2 className="font-semibold">{p.title}</h2>
              <p className="text-xs text-white/50 mt-1">{p.date}</p>
              <p className="text-sm text-white/80 mt-3">{p.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
