import React from 'react'
import { Helmet } from 'react-helmet-async'
import bcrypt from 'bcryptjs'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  ADMIN_ACCOUNT,
  EMPLOYEE_ACCOUNTS,
  CLIENT_ACCOUNTS,
  findAccountByEmail
} from '../utils/authConfig'
import {
  loadPortalState,
  savePortalState,
  createSession,
  readSession,
  clearSession
} from '../utils/secureStorage'
import { generateEmailDraft } from '../utils/emailGenerator'

const ROLE_TABS = [
  { id: 'admin', label: 'Admin' },
  { id: 'employee', label: 'Employees' },
  { id: 'client', label: 'Clients' }
]

export default function Portal() {
  const defaultState = React.useMemo(() => createDefaultAssignments(), [])
  const [portalState, setPortalState] = React.useState(() => loadPortalState(defaultState))
  const [session, setSession] = React.useState(() => readSession())
  const [activeRole, setActiveRole] = React.useState(() => readSession()?.role || 'admin')
  const [alert, setAlert] = React.useState(null)

  React.useEffect(() => {
    savePortalState(portalState)
  }, [portalState])

  React.useEffect(() => {
    if (session?.role) {
      setActiveRole(session.role)
    }
  }, [session])

  const handleLogin = React.useCallback((role, email, password) => {
    const account = findAccountByEmail(role, email)
    if (!account) {
      setAlert({ type: 'error', message: 'We could not find an account with that email address.' })
      return false
    }
    const verified = bcrypt.compareSync(password, account.passwordHash)
    if (!verified) {
      setAlert({ type: 'error', message: 'Incorrect password. Please try again.' })
      return false
    }
    const newSession = createSession({ role, accountId: account.id })
    setSession(newSession)
    setAlert({ type: 'success', message: `Welcome back, ${account.name.split(' ')[0]}!` })
    return true
  }, [])

  const handleLogout = React.useCallback(() => {
    clearSession()
    setSession(null)
    setActiveRole('admin')
    setAlert({ type: 'info', message: 'You have been securely signed out.' })
  }, [])

  const handleAssign = React.useCallback((clientId, employeeId) => {
    setPortalState((current) => {
      const next = createDefaultAssignments()
      next.assignments = mergeAssignments(next.assignments, current.assignments)
      const assignments = next.assignments

      // Remove client from previous assignment
      const previousEmployeeId = assignments.byClient[clientId]
      if (previousEmployeeId) {
        assignments.byEmployee[previousEmployeeId] = assignments.byEmployee[previousEmployeeId].filter((id) => id !== clientId)
      }

      assignments.byClient[clientId] = employeeId
      if (!assignments.byEmployee[employeeId]) assignments.byEmployee[employeeId] = []
      assignments.byEmployee[employeeId] = Array.from(new Set([...assignments.byEmployee[employeeId], clientId]))
      return { assignments }
    })

    const client = CLIENT_ACCOUNTS.find((item) => item.id === clientId)
    const employee = EMPLOYEE_ACCOUNTS.find((item) => item.id === employeeId)
    if (client && employee) {
      setAlert({ type: 'success', message: `${client.name} is now partnered with ${employee.name}.` })
    }
  }, [])

  const assignments = React.useMemo(() => {
    if (portalState?.assignments) return portalState.assignments
    return createDefaultAssignments().assignments
  }, [portalState])

  const sessionAccount = React.useMemo(() => {
    if (!session?.accountId || !session?.role) return null
    if (session.role === 'admin') return ADMIN_ACCOUNT
    if (session.role === 'employee') return EMPLOYEE_ACCOUNTS.find((item) => item.id === session.accountId) || null
    if (session.role === 'client') return CLIENT_ACCOUNTS.find((item) => item.id === session.accountId) || null
    return null
  }, [session])

  const pageTitle = sessionAccount ? `${sessionAccount.name} • VetWraps Portal` : 'Portal Login • VetWraps'

  return (
    <div className="min-h-screen bg-night text-white orbital-bg overflow-hidden">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Secure VetWraps portal for admins, employees, and clients." />
      </Helmet>
      <Navbar />
      <main className="relative">
        <GradientBackdrop />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <header className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">VetWraps Command Center</p>
            <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">Unified login for admins, employees, and clients</h1>
            <p className="mt-3 text-white/70 text-sm sm:text-base">
              Manage engagements, collaborate with your VetWraps team, and deliver premium digital design experiences—all from one encrypted hub.
            </p>
          </header>

          {alert && <InlineAlert variant={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />}

          {!sessionAccount && (
            <LoginPanels
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              onSubmit={handleLogin}
            />
          )}

          {sessionAccount && session?.role === 'admin' && (
            <AdminDashboard
              assignments={assignments}
              onAssign={handleAssign}
              onLogout={handleLogout}
            />
          )}

          {sessionAccount && session?.role === 'employee' && (
            <EmployeeDashboard
              assignments={assignments}
              employee={sessionAccount}
              onLogout={handleLogout}
            />
          )}

          {sessionAccount && session?.role === 'client' && (
            <ClientDashboard
              assignments={assignments}
              client={sessionAccount}
              onLogout={handleLogout}
            />
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}

function LoginPanels({ activeRole, onRoleChange, onSubmit }) {
  const [formState, setFormState] = React.useState({ email: '', password: '', loading: false })
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    setError(null)
    setFormState({ email: '', password: '', loading: false })
  }, [activeRole])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!formState.email || !formState.password) {
      setError('Email and password are both required.')
      return
    }
    setError(null)
    setFormState((prev) => ({ ...prev, loading: true }))
    const success = onSubmit(activeRole, formState.email, formState.password)
    if (!success) {
      setError('Unable to verify those credentials.')
      setFormState((prev) => ({ ...prev, loading: false }))
      return
    }
    setFormState({ email: '', password: '', loading: false })
  }

  return (
    <section className="mt-12 glass border border-white/10 rounded-2xl shadow-innerGlow overflow-hidden">
      <div className="grid md:grid-cols-[240px,1fr]">
        <aside className="bg-white/[0.04] border-r border-white/5">
          <nav className="flex md:flex-col">
            {ROLE_TABS.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => onRoleChange(role.id)}
                className={`flex-1 px-4 py-4 text-xs tracking-[0.25em] uppercase transition ${
                  activeRole === role.id ? 'bg-white/10 text-white font-semibold' : 'text-white/60 hover:text-white'
                }`}
              >
                {role.label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{tabTitle(activeRole)}</h2>
              <p className="mt-2 text-sm text-white/60 max-w-xl">
                {tabDescription(activeRole)}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-white/70">Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  className="mt-2 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                  value={formState.email}
                  onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="text-white/70">Password</span>
                <input
                  type="password"
                  autoComplete={activeRole === 'admin' ? 'current-password' : 'new-password'}
                  className="mt-2 w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                  value={formState.password}
                  onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="••••••••"
                  required
                />
              </label>
            </div>
            {error && <p className="text-sm text-accent-orange">{error}</p>}
            <button
              type="submit"
              disabled={formState.loading}
              className="inline-flex items-center justify-center px-5 py-3 rounded-md bg-accent-blue/80 hover:bg-accent-blue transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night focus:ring-accent-blue disabled:opacity-70"
            >
              {formState.loading ? 'Checking…' : 'Access portal'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function AdminDashboard({ assignments, onAssign, onLogout }) {
  const [selectedClient, setSelectedClient] = React.useState(CLIENT_ACCOUNTS[0]?.id)
  const [selectedEmployee, setSelectedEmployee] = React.useState(() => assignments.byClient[CLIENT_ACCOUNTS[0]?.id] || EMPLOYEE_ACCOUNTS[0]?.id)
  const [emailDraft, setEmailDraft] = React.useState(null)
  const [notes, setNotes] = React.useState('')
  const [tone, setTone] = React.useState('warm')

  React.useEffect(() => {
    if (!selectedClient) return
    const currentEmployee = assignments.byClient[selectedClient]
    if (currentEmployee) setSelectedEmployee(currentEmployee)
  }, [assignments, selectedClient])

  const handleGenerateEmail = () => {
    const client = CLIENT_ACCOUNTS.find((item) => item.id === selectedClient)
    const employee = EMPLOYEE_ACCOUNTS.find((item) => item.id === selectedEmployee)
    if (!client || !employee) return
    const summary = `${employee.name} will lead ${client.name}'s digital design program with a focus on ${employee.focus}`
    const draft = generateEmailDraft({
      tone,
      senderName: employee.name,
      recipientName: client.name,
      serviceFocus: client.projectFocus || employee.focus,
      assignmentSummary: summary,
      nextMilestone: 'a kickoff sync next week',
      additionalNotes: notes
    })
    setEmailDraft(draft)
  }

  const handleAssign = () => {
    if (!selectedClient || !selectedEmployee) return
    onAssign(selectedClient, selectedEmployee)
  }

  const assignedEmployees = EMPLOYEE_ACCOUNTS.map((employee) => ({
    ...employee,
    clients: (assignments.byEmployee[employee.id] || []).map((clientId) => CLIENT_ACCOUNTS.find((item) => item.id === clientId)).filter(Boolean)
  }))

  return (
    <section className="mt-16 space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Admin control room</h2>
          <p className="text-sm text-white/60">Assign clients to your design specialists and craft polished emails instantly.</p>
        </div>
        <button onClick={onLogout} className="text-sm text-white/70 hover:text-white focus:outline-none focus:underline">Log out</button>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass border border-white/10 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-semibold">Assign clients</h3>
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="text-white/70">Client</span>
              <select
                value={selectedClient}
                onChange={(event) => setSelectedClient(event.target.value)}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
              >
                {CLIENT_ACCOUNTS.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} — {client.organization}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-white/70">Employee</span>
              <select
                value={selectedEmployee}
                onChange={(event) => setSelectedEmployee(event.target.value)}
                className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
              >
                {EMPLOYEE_ACCOUNTS.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} — {employee.focus}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={handleAssign}
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-accent-blue/80 hover:bg-accent-blue transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-night focus:ring-accent-blue"
            >
              Assign client
            </button>
          </div>

          <div className="pt-6 border-t border-white/5">
            <h4 className="text-sm uppercase tracking-[0.3em] text-white/50">AI email generator</h4>
            <p className="mt-2 text-sm text-white/70">Generate a kickoff note that introduces the assigned specialist.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                Tone
                <select
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                >
                  <option value="warm">Warm</option>
                  <option value="professional">Professional</option>
                  <option value="energetic">Energetic</option>
                </select>
              </label>
              <label className="text-xs uppercase tracking-[0.2em] text-white/60">
                Add a personal note
                <input
                  type="text"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Welcome message or milestone"
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleGenerateEmail}
              className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-blue/40"
            >
              Generate email draft
            </button>
            {emailDraft && (
              <EmailPreview draft={emailDraft} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {assignedEmployees.map((employee) => (
            <article key={employee.id} className="glass border border-white/10 rounded-2xl p-6">
              <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{employee.name}</h3>
                  <p className="text-sm text-white/60">{employee.title}</p>
                </div>
                <Badge>{employee.clients.length} client{employee.clients.length === 1 ? '' : 's'}</Badge>
              </header>
              <ul className="mt-4 space-y-3 text-sm text-white/70">
                {employee.clients.length === 0 && <li>No clients assigned yet.</li>}
                {employee.clients.map((client) => (
                  <li key={client.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{client.name}</p>
                      <p className="text-white/60">{client.organization}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-white/40">{client.projectFocus}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function EmployeeDashboard({ assignments, employee, onLogout }) {
  const clientIds = assignments.byEmployee[employee.id] || []
  const [selectedClientId, setSelectedClientId] = React.useState(clientIds[0] || null)
  const [tone, setTone] = React.useState('warm')
  const [notes, setNotes] = React.useState('')
  const [draft, setDraft] = React.useState(null)

  React.useEffect(() => {
    if (clientIds.length && !clientIds.includes(selectedClientId)) {
      setSelectedClientId(clientIds[0])
    }
  }, [clientIds, selectedClientId])

  const clients = clientIds
    .map((id) => CLIENT_ACCOUNTS.find((client) => client.id === id))
    .filter(Boolean)

  const handleGenerate = () => {
    const client = clients.find((item) => item.id === selectedClientId)
    if (!client) return
    const draftResult = generateEmailDraft({
      tone,
      senderName: employee.name,
      recipientName: client.name,
      serviceFocus: client.projectFocus,
      assignmentSummary: `I’ll be your point-person for ${client.projectFocus.toLowerCase()} across our digital design initiative`,
      nextMilestone: 'our first performance review call',
      additionalNotes: notes
    })
    setDraft(draftResult)
  }

  return (
    <section className="mt-16 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back, {employee.name}</h2>
          <p className="text-sm text-white/60">Review your client list and personalize the next touchpoint.</p>
        </div>
        <button onClick={onLogout} className="text-sm text-white/70 hover:text-white focus:outline-none focus:underline">Log out</button>
      </header>

      <div className="glass border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Assigned clients</h3>
        <p className="mt-2 text-sm text-white/60">Select a client to generate an on-brand email update.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-white/70">
            Client
            <select
              value={selectedClientId || ''}
              onChange={(event) => setSelectedClientId(event.target.value)}
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} — {client.organization}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/70">
            Tone
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
            >
              <option value="warm">Warm</option>
              <option value="professional">Professional</option>
              <option value="energetic">Energetic</option>
            </select>
          </label>
          <label className="sm:col-span-2 text-sm text-white/70">
            Add context
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Highlight wins or blockers"
              className="mt-2 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue/60"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-blue/40"
        >
          Generate email
        </button>
        {draft && <EmailPreview draft={draft} />}
      </div>

      <section className="glass border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold">At-a-glance assignments</h3>
        <ul className="mt-4 space-y-3 text-sm text-white/70">
          {clients.map((client) => (
            <li key={client.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="font-medium text-white">{client.name}</p>
                <p className="text-white/60">{client.organization}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">{client.projectFocus}</span>
            </li>
          ))}
          {clients.length === 0 && <li>No clients assigned yet.</li>}
        </ul>
      </section>
    </section>
  )
}

function ClientDashboard({ assignments, client, onLogout }) {
  const employeeId = assignments.byClient[client.id]
  const employee = employeeId ? EMPLOYEE_ACCOUNTS.find((item) => item.id === employeeId) : null

  return (
    <section className="mt-16 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Welcome, {client.name}</h2>
          <p className="text-sm text-white/60">This hub keeps your digital design partnership with VetWraps transparent and proactive.</p>
        </div>
        <button onClick={onLogout} className="text-sm text-white/70 hover:text-white focus:outline-none focus:underline">Log out</button>
      </header>

      <div className="glass border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Your VetWraps team</h3>
        {employee ? (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-white text-lg font-medium">{employee.name}</p>
              <p className="text-sm text-white/60">{employee.title}</p>
            </div>
            <div className="text-sm text-white/60">
              <p className="uppercase tracking-[0.25em] text-xs text-white/40">Design focus</p>
              <p>{employee.focus}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-white/70">An account lead will be assigned shortly.</p>
        )}
      </div>

      <div className="glass border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Need a quick update?</h3>
        <p className="mt-2 text-sm text-white/70">
          Email <a href={`mailto:${employee?.email || 'operations@vetwraps.com'}`} className="text-accent-blue hover:underline">{employee?.email || 'operations@vetwraps.com'}</a> for a priority response.
        </p>
        <p className="mt-3 text-sm text-white/60">
          Your engagement focus: <span className="text-white">{client.projectFocus}</span>
        </p>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/40">Upcoming milestones</p>
        <ul className="mt-3 space-y-2 text-sm text-white/70 list-disc list-inside">
          <li>Analytics dashboard refresh — next week</li>
          <li>Automation QA pass — in two weeks</li>
          <li>Quarterly growth workshop — next month</li>
        </ul>
      </div>
    </section>
  )
}

function EmailPreview({ draft }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.warn('Clipboard copy failed', error)
    }
  }

  return (
    <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Suggested subject</p>
          <p className="text-sm text-white font-medium">{draft.subject}</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="self-start sm:self-auto text-xs uppercase tracking-[0.2em] px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 border border-white/10"
        >
          {copied ? 'Copied!' : 'Copy email'}
        </button>
      </div>
      <pre className="mt-4 whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-sans">{draft.body}</pre>
    </div>
  )
}

function InlineAlert({ variant, message, onDismiss }) {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
    error: 'bg-rose-500/10 text-rose-300 border-rose-400/30',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/40'
  }

  return (
    <div className={`mt-10 rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${styles[variant] || styles.info}`} role="status">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-auto text-xs uppercase tracking-[0.2em]">Dismiss</button>
      )}
    </div>
  )
}

function GradientBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-accent-blue/20 blur-3xl animate-drift"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-accent-orange/10 blur-3xl animate-pulseSlow"
        style={{ animationDelay: '1.2s' }}
      />
      <div
        className="absolute -bottom-32 left-16 h-80 w-80 rounded-full bg-accent-blue/10 blur-3xl animate-drift"
        style={{ animationDelay: '2.4s', animationDirection: 'alternate' }}
      />
    </div>
  )
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] text-white/60">
      {children}
    </span>
  )
}

function tabTitle(role) {
  switch (role) {
    case 'admin':
      return 'Admin login'
    case 'employee':
      return 'Employee login'
    case 'client':
      return 'Client login'
    default:
      return 'Portal access'
  }
}

function tabDescription(role) {
  switch (role) {
    case 'admin':
      return 'Sign in to orchestrate client assignments, review team load, and broadcast the next creative sprint.'
    case 'employee':
      return 'Access creative playbooks, review assigned accounts, and send curated updates in a click.'
    case 'client':
      return 'Check who is on your VetWraps digital design squad, track milestones, and stay in sync.'
    default:
      return ''
  }
}

function createDefaultAssignments() {
  const byEmployee = {}
  const byClient = {}
  EMPLOYEE_ACCOUNTS.forEach((employee) => {
    byEmployee[employee.id] = []
  })
  CLIENT_ACCOUNTS.forEach((client, index) => {
    const employee = EMPLOYEE_ACCOUNTS[index % EMPLOYEE_ACCOUNTS.length]
    if (!employee) return
    byEmployee[employee.id].push(client.id)
    byClient[client.id] = employee.id
  })
  return { assignments: { byEmployee, byClient } }
}

function mergeAssignments(base, source) {
  const merged = {
    byEmployee: { ...base.byEmployee },
    byClient: { ...base.byClient }
  }

  if (!source) return merged

  Object.entries(source.byEmployee || {}).forEach(([employeeId, clients]) => {
    merged.byEmployee[employeeId] = Array.from(new Set([...(merged.byEmployee[employeeId] || []), ...clients]))
  })

  Object.entries(source.byClient || {}).forEach(([clientId, employeeId]) => {
    merged.byClient[clientId] = employeeId
  })

  return merged
}
