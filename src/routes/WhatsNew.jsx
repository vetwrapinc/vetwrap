import React from 'react'

const posts = [
  { title: 'Studio Update', date: '2025-01-02', summary: 'Operational improvements and new retainers.' },
  { title: 'Giving Back', date: '2025-02-15', summary: '10% profits supporting veterans overseas.' }
]

export default function WhatsNew() {
  return (
    <div className="min-h-screen bg-night text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight">What’s New?</h1>
        <p className="text-white/70 mt-2">Updates, announcements, and insights.</p>
        <div className="mt-8 space-y-4">
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

