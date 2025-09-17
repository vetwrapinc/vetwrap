import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useSession } from '../utils/session'
import { authFetch } from '../utils/api'

export default function Subscribers() {
  const { status, user, data, login, logout, refresh, busy } = useSession()
  const [loginForm, setLoginForm] = React.useState({ email: '', password: '' })
  const [loginError, setLoginError] = React.useState('')
  const [banner, setBanner] = React.useState('')
  const [quotes, setQuotes] = React.useState(null)
  const [quotesError, setQuotesError] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [assignBusy, setAssignBusy] = React.useState('')
  const [createBusy, setCreateBusy] = React.useState(false)
  const [createError, setCreateError] = React.useState('')
  const [createSuccess, setCreateSuccess] = React.useState('')
  const [newUser, setNewUser] = React.useState({ name: '', email: '', role: 'client', password: '' })

  const loadQuotes = React.useCallback(async () => {
    setQuotesError('')
    try {
      const res = await authFetch('/api/quotes-list')
      if (!res.ok) throw new Error('Unable to load quotes')
      const payload = await res.json()
      setQuotes(payload.items || [])
    } catch (err) {
      setQuotesError(err.message || 'Unable to load quotes')
      setQuotes([])
    }
  }, [])

  React.useEffect(() => {
    if (user?.role === 'admin') {
      loadQuotes()
    } else {
      setQuotes(null)
    }
  }, [user, loadQuotes])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setBanner('')
    try {
      await login({ email: loginForm.email, password: loginForm.password })
      setLoginForm({ email: '', password: '' })
    } catch (err) {
      setLoginError(err.message || 'Sign-in failed')
    }
  }

  const handleAssign = async (clientId, employeeId) => {
    setAssignBusy(clientId)
    setBanner('')
    try {
      const res = await authFetch('/api/portal-assign', {
        method: 'POST',
        body: { clientId, employeeId: employeeId || null },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Assignment update failed')
      }
      await refresh()
      setBanner('Assignment updated')
    } catch (err) {
      setBanner(err.message || 'Assignment update failed')
    } finally {
      setAssignBusy('')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateBusy(true)
    setCreateError('')
    setCreateSuccess('')
    setBanner('')
    try {
      if (newUser.password.length < 8) {
        throw new Error('Password must be at least 8 characters long')
      }
      const res = await authFetch('/api/portal-users', {
        method: 'POST',
        body: newUser,
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Unable to create user')
      }
      setCreateSuccess('User created successfully')
      setNewUser({ name: '', email: '', role: newUser.role, password: '' })
      await refresh()
    } catch (err) {
      setCreateError(err.message || 'Unable to create user')
    } finally {
      setCreateBusy(false)
    }
  }

  const adminData = data?.admin
  const employeeData = data?.employee
  const clientData = data?.client

  const handlePortalRefresh = React.useCallback(async () => {
    await refresh()
    if ((user?.role || '') === 'admin') {
      await loadQuotes()
    }
  }, [refresh, user?.role, loadQuotes])

  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>VetWraps Portal</title>
      </Helmet>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        {status === 'loading' ? (
          <p className="text-white/70">Loading…</p>
        ) : status !== 'authenticated' ? (
          <LoginView
            form={loginForm}
            onChange={setLoginForm}
            onSubmit={handleLogin}
            error={loginError}
            busy={busy}
          />
        ) : (
          <>
            <PortalHeader user={user} onLogout={logout} onRefresh={handlePortalRefresh} />
            {banner && (
              <div className="mt-4 rounded-md border border-accent-blue/40 bg-accent-blue/10 px-4 py-3 text-sm text-accent-blue">
                {banner}
              </div>
            )}

            {user.role === 'admin' && (
              <AdminDashboard
                data={adminData}
                quotes={quotes}
                quotesError={quotesError}
                statusFilter={statusFilter}
                onStatusFilter={setStatusFilter}
                onRefreshQuotes={loadQuotes}
                onAssign={handleAssign}
                assignBusy={assignBusy}
                newUser={newUser}
                onNewUserChange={setNewUser}
                onCreateUser={handleCreateUser}
                createBusy={createBusy}
                createError={createError}
                createSuccess={createSuccess}
              />
            )}

            {user.role === 'employee' && (
              <EmployeeDashboard data={employeeData} />
            )}

            {user.role === 'client' && (
              <ClientDashboard data={clientData} user={user} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function LoginView({ form, onChange, onSubmit, error, busy }) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-semibold tracking-tight">VetWraps Portal</h1>
      <p className="text-white/70 mt-2 text-sm">Sign in to access your workspace.</p>
      <form onSubmit={onSubmit} className="mt-8 glass border border-glass rounded-xl p-6 max-w-md mx-auto text-left space-y-4">
        <div>
          <label className="block text-sm text-white/70">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange((prev) => ({ ...prev, email: e.target.value }))}
            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-white/70">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => onChange((prev) => ({ ...prev, password: e.target.value }))}
            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="••••••••"
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-accent-blue/80 hover:bg-accent-blue px-4 py-2 font-medium text-white transition"
          disabled={busy}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

function PortalHeader({ user, onLogout, onRefresh }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name || user?.email}</h1>
        <p className="text-white/60 text-sm">Role: {user?.role}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          Refresh
        </button>
        <button
          onClick={onLogout}
          className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

function AdminDashboard({
  data,
  quotes,
  quotesError,
  statusFilter,
  onStatusFilter,
  onRefreshQuotes,
  onAssign,
  assignBusy,
  newUser,
  onNewUserChange,
  onCreateUser,
  createBusy,
  createError,
  createSuccess,
}) {
  const clients = data?.clients || []
  const employees = data?.employees || []
  const assignedMap = new Map(clients.map((client) => [client.id, client.assignment?.id || '']))

  return (
    <div className="mt-10 space-y-10">
      <section className="glass border border-glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Team snapshot</h2>
        {employees.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">No employees yet. Create a teammate below.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {employees.map((employee) => (
              <div key={employee.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="font-medium">{employee.name || employee.email}</p>
                <p className="text-xs text-white/60">{employee.email}</p>
                <p className="mt-2 text-xs text-white/60">Assigned clients: {employee.clientCount}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass border border-glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Assign clients</h2>
        {clients.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">Create a client account to begin assignments.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{client.name || client.email}</p>
                  <p className="text-xs text-white/60">{client.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-white/60">Assigned to</label>
                  <select
                    className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm"
                    value={assignedMap.get(client.id)}
                    onChange={(e) => onAssign(client.id, e.target.value || null)}
                    disabled={assignBusy === client.id}
                  >
                    <option value="">Unassigned</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name || employee.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass border border-glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Invite a new user</h2>
        <p className="text-sm text-white/60">Admins can create client or employee credentials instantly.</p>
        <form onSubmit={onCreateUser} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-1">
            <label className="block text-xs uppercase tracking-wide text-white/50">Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => onNewUserChange((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs uppercase tracking-wide text-white/50">Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => onNewUserChange((prev) => ({ ...prev, email: e.target.value }))}
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Role</label>
            <select
              value={newUser.role}
              onChange={(e) => onNewUserChange((prev) => ({ ...prev, role: e.target.value }))}
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              <option value="client">Client</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Temporary password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => onNewUserChange((prev) => ({ ...prev, password: e.target.value }))}
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="At least 8 characters"
              required
            />
          </div>
          {createError && <p className="md:col-span-2 text-sm text-red-400">{createError}</p>}
          {createSuccess && <p className="md:col-span-2 text-sm text-accent-blue">{createSuccess}</p>}
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-accent-blue/80 hover:bg-accent-blue px-4 py-2 text-sm font-medium"
              disabled={createBusy}
            >
              {createBusy ? 'Creating…' : 'Create user'}
            </button>
          </div>
        </form>
        <p className="mt-3 text-xs text-white/40">
          Tip: share the generated credentials securely. Admin emails must still be on the environment allowlist.
        </p>
      </section>

      <AIEmailGenerator />

      <QuotesSection
        quotes={quotes}
        quotesError={quotesError}
        statusFilter={statusFilter}
        onStatusFilter={onStatusFilter}
        onRefresh={onRefreshQuotes}
      />
    </div>
  )
}

function EmployeeDashboard({ data }) {
  const clients = data?.clients || []
  return (
    <div className="mt-10 space-y-10">
      <section className="glass border border-glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Your clients</h2>
        {clients.length === 0 ? (
          <p className="mt-3 text-sm text-white/60">No active assignments yet. Check back soon.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {clients.map((client) => (
              <div key={client.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="font-medium">{client.name || client.email}</p>
                <p className="text-xs text-white/60">{client.email}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <AIEmailGenerator />
    </div>
  )
}

function ClientDashboard({ data, user }) {
  const employee = data?.employee
  return (
    <div className="mt-10 space-y-10">
      <section className="glass border border-glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Project team</h2>
        {employee ? (
          <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="font-medium">{employee.name || employee.email}</p>
            <p className="text-xs text-white/60">{employee.email}</p>
            <p className="mt-3 text-sm text-white/70">
              Feel free to reach out directly or reply to the latest project email for tailored updates.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/60">
            You are currently unassigned. The VetWraps team will connect you with a specialist shortly.
          </p>
        )}
      </section>

      <section className="glass border border-glass rounded-xl p-6">
        <h2 className="text-lg font-semibold">Need a hand?</h2>
        <p className="mt-3 text-sm text-white/70">
          Email <a href={`mailto:hello@vetwraps.com?subject=Support%20for%20${encodeURIComponent(user?.name || user?.email)}`} className="text-accent-blue hover:underline">hello@vetwraps.com</a>{' '}
          or reply in the portal to keep your project moving.
        </p>
      </section>
    </div>
  )
}

function QuotesSection({ quotes, quotesError, statusFilter, onStatusFilter, onRefresh }) {
  return (
    <section className="glass border border-glass rounded-xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Recent quotes</h2>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
            className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="processed">Processed</option>
          </select>
          <button
            onClick={onRefresh}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80 hover:text-white"
          >
            Refresh
          </button>
        </div>
      </div>
      {!quotes && !quotesError && <p className="mt-4 text-sm text-white/70">Loading…</p>}
      {quotesError && <p className="mt-4 text-sm text-red-400">{quotesError}</p>}
      {quotes && quotes.length === 0 && !quotesError && (
        <p className="mt-4 text-sm text-white/70">No quotes yet.</p>
      )}
      {quotes && quotes.length > 0 && (
        <div className="mt-6 overflow-x-auto">
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
              {quotes
                .filter((q) => statusFilter === 'all' || (q.status || 'new') === statusFilter)
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
                      <RowActions id={q.id} onDone={onRefresh} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function RowActions({ id, onDone }) {
  const update = async (payload) => {
    const res = await authFetch('/api/quote-update', {
      method: 'POST',
      body: { id, ...payload },
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}))
      throw new Error(detail.error || 'Update failed')
    }
    await onDone()
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={() => update({ status: 'in_progress' }).catch((err) => alert(err.message))}
        className="rounded bg-white/10 px-2 py-1 border border-white/10 hover:border-accent-blue/50"
      >
        In Progress
      </button>
      <button
        onClick={() => update({ status: 'processed', processedAt: true }).catch((err) => alert(err.message))}
        className="rounded bg-white/10 px-2 py-1 border border-white/10 hover:border-accent-amber/50"
      >
        Processed
      </button>
    </div>
  )
}

function formatDate(s) {
  try {
    return new Date(s).toLocaleString()
  } catch {
    return s
  }
}

function isDueSoon(q) {
  try {
    const created = new Date(q.createdAt)
    const days = q.rush ? 5.5 : 7.5
    const due = new Date(created.getTime() + days * 24 * 3600 * 1000)
    const left = +due - Date.now()
    return left < 48 * 3600 * 1000
  } catch {
    return false
  }
}

function statusBadge(s) {
  const base = 'px-2 py-0.5 rounded text-xs border'
  if (s === 'processed') return <span className={`${base} border-white/10 bg-white/10 text-white/80`}>Processed</span>
  if (s === 'in_progress') return <span className={`${base} border-accent-blue/30 bg-accent-blue/10 text-accent-blue`}>In Progress</span>
  return <span className={`${base} border-white/10 bg-white/5 text-white/80`}>New</span>
}

function AIEmailGenerator() {
  const [form, setForm] = React.useState({
    recipient: '',
    subject: '',
    context: '',
    tone: 'professional',
    length: 'medium',
  })
  const [draft, setDraft] = React.useState('')
  const [provider, setProvider] = React.useState('')
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setCopied(false)
    try {
      if (!form.context.trim()) throw new Error('Add a bit of context for the generator')
      const res = await authFetch('/api/ai-email', { method: 'POST', body: form })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Unable to generate email')
      }
      const payload = await res.json()
      setDraft(payload.draft || '')
      setProvider(payload.provider || '')
    } catch (err) {
      setError(err.message || 'Unable to generate email')
      setDraft('')
      setProvider('')
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    if (!draft) return
    try {
      await navigator.clipboard?.writeText(draft)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Clipboard error', err)
    }
  }

  return (
    <section className="glass border border-glass rounded-xl p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">AI email generator</h2>
        {provider && <span className="text-xs text-white/60">Provider: {provider}</span>}
      </div>
      <p className="mt-2 text-sm text-white/60">Draft polished outreach or update emails in seconds.</p>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wide text-white/50">Recipient (optional)</label>
          <input
            type="text"
            value={form.recipient}
            onChange={(e) => setForm((prev) => ({ ...prev, recipient: e.target.value }))}
            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="Client name"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-white/50">Subject (optional)</label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="Project update"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs uppercase tracking-wide text-white/50">Context</label>
          <textarea
            value={form.context}
            onChange={(e) => setForm((prev) => ({ ...prev, context: e.target.value }))}
            rows={4}
            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            placeholder="Share the goals, key updates, or next steps you want to cover."
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-white/50">Tone</label>
          <select
            value={form.tone}
            onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="urgent">Urgent</option>
            <option value="celebratory">Celebratory</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-white/50">Length</label>
          <select
            value={form.length}
            onChange={(e) => setForm((prev) => ({ ...prev, length: e.target.value }))}
            className="mt-1 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="brief">Brief</option>
            <option value="medium">Medium</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
        {error && <p className="md:col-span-2 text-sm text-red-400">{error}</p>}
        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setForm({ recipient: '', subject: '', context: '', tone: 'professional', length: 'medium' })}
            className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
          >
            Reset
          </button>
          <button
            type="submit"
            className="rounded-md bg-accent-blue/80 hover:bg-accent-blue px-4 py-2 text-sm font-medium"
            disabled={busy}
          >
            {busy ? 'Generating…' : 'Generate email'}
          </button>
        </div>
      </form>
      {draft && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Suggested draft</h3>
            <button
              onClick={handleCopy}
              className="text-xs text-accent-blue hover:underline"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-white/80">
            {draft}
          </pre>
        </div>
      )}
    </section>
  )
}
