import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useIdentity } from '../utils/identity'
import { authFetch } from '../utils/api'

export default function Subscribers() {
  const { user, ready, login, logout } = useIdentity()
  const [adminToken, setAdminToken] = React.useState(() => localStorage.getItem('vetwraps_admin_token') || '')
  const [items, setItems] = React.useState(null)
  const [error, setError] = React.useState(null)
  const [statusFilter, setStatusFilter] = React.useState('all')

  async function load() {
    setError(null)
    setItems(null)
    try {
      const res = await authFetch('/api/quotes-list')
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setItems(data.items || [])
    } catch (e) {
      setError(e.message || 'Error')
    }
  }

  React.useEffect(() => {
    if (user) load()
  }, [user])
  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Internal Dashboard — Subscribers</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        {!ready ? (
          <p className="text-white/70">Loading…</p>
        ) : (!user && !adminToken) ? (
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Restricted</h1>
            <p className="text-white/70 mt-2 text-sm">Provide an admin token or sign in.</p>
            <div className="mt-4 max-w-sm mx-auto">
              <input value={adminToken} onChange={(e)=>setAdminToken(e.target.value)} placeholder="x-admin-token" className="w-full bg-white/5 border-white/15 rounded-md" />
              <div className="mt-3 flex items-center justify-center gap-3">
                <button onClick={()=>{ localStorage.setItem('vetwraps_admin_token', adminToken); load() }} className="px-4 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50">Use Token</button>
                <button onClick={login} className="px-4 py-2 rounded bg-white/10 border border-white/15 hover:border-accent-blue/50">Sign In</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">Internal Dashboard</h1>
              <button onClick={logout} className="text-sm text-white/80 hover:text-white">Log out</button>
            </div>
            <p className="text-white/70 mt-2 text-sm">Welcome, {user?.user_metadata?.full_name || user.email}</p>
            <div className="mt-6 rounded-xl glass border border-glass p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Recent Quotes</h2>
                <div className="flex items-center gap-3">
                  <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="bg-white/5 border-white/15 rounded text-sm">
                    <option value="all">All</option>
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="processed">Processed</option>
                  </select>
                  <button onClick={load} className="text-sm text-white/80 hover:text-white">Refresh</button>
                </div>
              </div>
              {!items && !error && (
                <p className="mt-4 text-sm text-white/70">Loading…</p>
              )}
              {error && (
                <p className="mt-4 text-sm text-red-400">{error}</p>
              )}
              {items && items.length === 0 && (
                <p className="mt-4 text-sm text-white/70">No quotes yet.</p>
              )}
              {items && items.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-white/70">
                      <tr>
                        <th className="text-left py-2 pr-4">Created</th>
                        <th className="text-left py-2 pr-4">Name</th>
                        <th className="text-left py-2 pr-4">Email</th>
                        <th className="text-left py-2 pr-4">Project</th>
                        <th className="text-left py-2 pr-4">Rush</th>
                        <th className="text-left py-2 pr-4">Status</th>
                        <th className="text-left py-2 pr-4">Assignee</th>
                        <th className="text-left py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items
                        .filter(q=> statusFilter==='all' || (q.status||'new')===statusFilter)
                        .map((q) => (
                        <tr key={q.id} className={`border-t border-white/10 ${isDueSoon(q) ? 'bg-accent-amber/5' : ''}`}>
                          <td className="py-2 pr-4 text-white/70">{formatDate(q.createdAt)}</td>
                          <td className="py-2 pr-4">{q.name}</td>
                          <td className="py-2 pr-4 text-white/80">{q.email}</td>
                          <td className="py-2 pr-4">{q.projectType}</td>
                          <td className="py-2 pr-4">{q.rush ? 'Yes' : 'No'}</td>
                          <td className="py-2 pr-4">{statusBadge(q.status || 'new')}</td>
                          <td className="py-2 pr-4">{q.assignee || '-'}</td>
                          <td className="py-2 pr-4">
                            <RowActions id={q.id} onDone={load} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatDate(s) {
  try { return new Date(s).toLocaleString() } catch { return s }
}

function isDueSoon(q) {
  try {
    const created = new Date(q.createdAt)
    const days = q.rush ? 5.5 : 7.5
    const due = new Date(created.getTime() + days * 24 * 3600 * 1000)
    const left = +due - Date.now()
    return left < 48 * 3600 * 1000
  } catch { return false }
}

function statusBadge(s) {
  const base = 'px-2 py-0.5 rounded text-xs border'
  if (s === 'processed') return <span className={`${base} border-white/10 bg-white/10 text-white/80`}>Processed</span>
  if (s === 'in_progress') return <span className={`${base} border-accent-blue/30 bg-accent-blue/10 text-accent-blue`}>In Progress</span>
  return <span className={`${base} border-white/10 bg-white/5 text-white/80`}>New</span>
}

function RowActions({ id, onDone }) {
  async function update(payload) {
    await authFetch('/api/quote-update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload })
    })
    await onDone()
  }
  return (
    <div className="flex items-center gap-2 text-xs">
      <button onClick={()=>update({ status: 'in_progress' })} className="px-2 py-1 rounded bg-white/10 border border-white/10 hover:border-accent-blue/50">In Progress</button>
      <button onClick={()=>update({ status: 'processed', processedAt: true })} className="px-2 py-1 rounded bg-white/10 border border-white/10 hover:border-accent-amber/50">Processed</button>
    </div>
  )
}
