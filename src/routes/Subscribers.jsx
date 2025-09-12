import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useIdentity } from '../utils/identity'

export default function Subscribers() {
  const { user, ready, login, logout } = useIdentity()
  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Internal Dashboard — Subscribers</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        {!ready ? (
          <p className="text-white/70">Loading…</p>
        ) : !user ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Restricted</h1>
            <p className="text-white/70 mt-2 text-sm">Sign in with Netlify Identity to continue.</p>
            <button onClick={login} className="mt-6 px-4 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50">Sign In</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">Internal Dashboard</h1>
              <button onClick={logout} className="text-sm text-white/80 hover:text-white">Log out</button>
            </div>
            <p className="text-white/70 mt-2 text-sm">Welcome, {user?.user_metadata?.full_name || user.email}</p>
            <div className="mt-6 rounded-xl glass border border-glass p-6">
              <p className="text-sm text-white/80">Future features:</p>
              <ul className="mt-2 text-sm text-white/70 list-disc pl-5">
                <li>Manage subscription clients</li>
                <li>Review form submissions</li>
                <li>Project status tracking</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
