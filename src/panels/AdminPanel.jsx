import React, { useMemo, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import AIEmailComposer from './components/AIEmailComposer'
import { Users, ClipboardList, CheckCircle2, AlertCircle, Target } from 'lucide-react'

function useRole() {
  const { user } = useUser()
  const role = user?.publicMetadata?.role || user?.unsafeMetadata?.role || 'client'
  return role
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user, isSignedIn, isLoaded } = useUser()
  const role = useRole()
  const { state, assignQuote, updateQuoteStatus, addManualUpdate } = useDashboard()
  const [drafts, setDrafts] = useState({})

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded) {
    return <PanelLoading label="Confirming admin clearance" />
  }

  if (!isSignedIn) {
    return <PanelLoading label="Redirecting to home" />
  }

  const stats = useMemo(() => {
    const total = state.quotes.length
    const assigned = state.quotes.filter((q) => q.status === 'assigned').length
    const inProgress = state.quotes.filter((q) => q.status === 'in_progress').length
    const completed = state.quotes.filter((q) => q.status === 'completed').length
    const intake = total - (assigned + inProgress + completed)
    return { total, assigned, inProgress, completed, intake }
  }, [state.quotes])

  const handleAssign = (quoteId) => {
    const draft = drafts[quoteId]
    if (!draft?.employeeId) return
    const value = Number(draft.value)
    if (!Number.isFinite(value) || value <= 0) return
    assignQuote({ quoteId, employeeId: draft.employeeId, value })
  }

  const handleStage = (quoteId, status) => {
    updateQuoteStatus({ quoteId, status })
    const quote = state.quotes.find((item) => item.id === quoteId)
    if (quote) {
      const message = status === 'completed'
        ? 'Admin confirmed delivery and archived assets.'
        : 'Admin advanced the schedule from the control room.'
      addManualUpdate({ quoteId, message, status })
    }
  }

  

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-night text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-accent-amber" />
          <h1 className="text-3xl font-semibold">Admin clearance required</h1>
          <p className="text-white/70 text-sm">
            You are signed in as {user?.primaryEmailAddress?.emailAddress}. Request admin privileges or use the employee or client dashboard.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm uppercase tracking-[0.3em]"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-night via-[#0f1626] to-night text-white">
      <header className="border-b border-white/10 backdrop-blur-md bg-night/70">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/60">Command Center</p>
            <h1 className="text-3xl font-semibold mt-2">Admin Mission Portal</h1>
            <p className="text-sm text-white/70 mt-1">
              Monitor every intake, push assignments, and spin up AI comms without leaving the dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
            <button
              onClick={() => navigate('/')}
              className="rounded-lg bg-white/10 border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white/15"
            >
              View Site
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 space-y-12">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={ClipboardList} label="Active Intakes" value={stats.intake} accent="from-accent-blue/20" />
          <StatCard icon={Users} label="Assigned" value={stats.assigned} accent="from-accent-amber/20" />
          <StatCard icon={Target} label="In Progress" value={stats.inProgress} accent="from-emerald-500/20" />
          <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} accent="from-purple-500/20" />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Quote Intake Queue</h2>
              <p className="text-sm text-white/60">
                Assign missions to specialists, adjust budgets, and push stage changes with one click.
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.35em] text-white/40">{stats.total} requests</span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-white/60 uppercase tracking-[0.3em] text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Project</th>
                  <th className="px-4 py-3 text-left">Stage</th>
                  <th className="px-4 py-3 text-left">Budget</th>
                  <th className="px-4 py-3 text-left">Assign</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {state.quotes.map((quote) => {
                  const draft = drafts[quote.id] || { employeeId: quote.assignedTo || '', value: quote.value }
                  const employee = state.employees.find((emp) => emp.id === quote.assignedTo)
                  return (
                    <tr key={quote.id} className="odd:bg-white/2 even:bg-white/[0.03]">
                      <td className="px-4 py-4 align-top">
                        <div className="font-medium">{quote.name}</div>
                        <div className="text-xs text-white/50">{quote.email}</div>
                        <div className="text-xs text-white/50 mt-1">Filed {new Date(quote.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="font-medium">{quote.projectType}</div>
                        {quote.rush && <span className="text-xs text-accent-amber">Rush requested</span>}
                        {quote.notes && (
                          <p className="text-xs text-white/60 mt-2 max-w-xs whitespace-pre-line">{quote.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top w-48">
                        <ProgressBadge percent={quote.progress} label={quote.stageLabel} />
                        <div className="mt-2 space-x-2">
                          {quote.status === 'assigned' && (
                            <button
                              onClick={() => handleStage(quote.id, 'in_progress')}
                              className="text-xs rounded-md bg-white/10 px-3 py-1 hover:bg-white/15"
                            >
                              Mark in progress
                            </button>
                          )}
                          {quote.status === 'in_progress' && (
                            <button
                              onClick={() => handleStage(quote.id, 'completed')}
                              className="text-xs rounded-md bg-accent-blue/20 px-3 py-1 hover:bg-accent-blue/30"
                            >
                              Close mission
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="text-lg font-semibold text-white">${quote.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
                        <div className="text-xs text-white/50">Employee takes +${quote.commission.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-4 align-top w-64">
                        <div className="space-y-2">
                          <select
                            value={draft.employeeId}
                            onChange={(event) => setDrafts((prev) => ({
                              ...prev,
                              [quote.id]: { ...draft, employeeId: event.target.value }
                            }))}
                            className="w-full dropdown-field border border-white/20 rounded-md px-3 py-2 text-sm font-medium"
                          >
                            <option value="">Select crew lead</option>
                            {state.employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            value={draft.value ?? quote.value}
                            onChange={(event) => setDrafts((prev) => ({
                              ...prev,
                              [quote.id]: { ...draft, value: Number(event.target.value) }
                            }))}
                            className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white/90 text-night"
                          />
                          <button
                            onClick={() => handleAssign(quote.id)}
                            className="w-full rounded-md bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white/20"
                          >
                            Assign mission
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="text-sm font-medium capitalize">{quote.status.replace('_', ' ')}</div>
                        {employee ? (
                          <p className="text-xs text-white/60 mt-1">{employee.name}</p>
                        ) : (
                          <p className="text-xs text-white/40 mt-1">Unassigned</p>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {state.quotes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-white/50 text-sm">
                      No requests yet. Once a client submits the form, the intake will appear here instantly.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">AI Email Ops</h2>
              <p className="text-sm text-white/60">Send rapid mission updates or debriefs straight from the command center.</p>
            </div>
          </div>
          <AIEmailComposer
            title="AI Email Generator"
            description="Author tailored updates for clients or team members with contextual tone control."
            defaultRecipient=""
          />
        </section>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} border border-white/10 grid place-items-center mb-4`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-xs uppercase tracking-[0.35em] text-white/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </motion.div>
  )
}

function PanelLoading({ label = 'Loading' }) {
  return (
    <div className="min-h-screen bg-night text-white flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-sm text-white/70">
        <div className="w-8 h-8 border-2 border-white/25 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p>{label}</p>
      </div>
    </div>
  )
}

function ProgressBadge({ percent, label }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-white/60 uppercase tracking-[0.3em]">{label}</div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-blue to-accent-amber" style={{ width: `${percent}%` }} />
      </div>
      <div className="text-xs text-white/50">{percent}% complete</div>
    </div>
  )
}

