import React from 'react'
import { Helmet } from 'react-helmet-async'

export default function Subscribers() {
  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Internal Dashboard — Subscribers</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Internal Dashboard</h1>
        <p className="text-white/70 mt-2 text-sm">Hidden route for subscription clients and developer management (placeholder).</p>
        <div className="mt-6 rounded-xl glass border border-glass p-6">
          <p className="text-sm text-white/80">Future features:</p>
          <ul className="mt-2 text-sm text-white/70 list-disc pl-5">
            <li>Authenticate team members</li>
            <li>Manage subscription clients</li>
            <li>Review form submissions</li>
            <li>Project status tracking</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

