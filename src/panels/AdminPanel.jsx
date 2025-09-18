import React, { useMemo, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import AIEmailComposer from './components/AIEmailComposer'
import {
  Users,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Target,
  Gauge,
  Download,
  ImagePlus,
  BarChart3,
  FolderCog
} from 'lucide-react'

function useRole() {
  const { user } = useUser()
  return user?.publicMetadata?.role || user?.unsafeMetadata?.role || 'client'
}

const stageOptions = [
  { value: 'new', label: 'Intake Review' },
  { value: 'assigned', label: 'Briefing and Research' },
  { value: 'in_progress', label: 'Design Execution' },
  { value: 'completed', label: 'Delivery and Debrief' }
]

const fileStatusOptions = ['Pending', 'Needs Files', 'Files Received', 'Ready for Delivery']

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user, isSignedIn, isLoaded } = useUser()
  const role = useRole()
  const {
    state,
    assignQuote,
    updateQuoteStatus,
    addManualUpdate,
    updateProjectTimeline,
    attachFinalAsset,
    updateAverageTurnaround,
    addClient,
    updateClient,
    deleteClient,
    addEmployee,
    updateEmployee,
    removeEmployee,
    updatePortfolioItem,
    addPortfolioItem,
    removePortfolioItem
  } = useDashboard()

  const [drafts, setDrafts] = useState({})
  const [assetDrafts, setAssetDrafts] = useState({})
  const [averageDraft, setAverageDraft] = useState(state.averageTurnaround)

  const adminName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Admin'

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  useEffect(() => {
    setAverageDraft(state.averageTurnaround)
  }, [state.averageTurnaround])

  if (!isLoaded) {
    return <PanelLoading label="Confirming admin clearance" />
  }

  if (!isSignedIn) {
    return <PanelLoading label="Redirecting to home" />
  }
  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-night text-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-accent-amber" />
          <h1 className="text-3xl font-semibold">Admin clearance required</h1>
          <p className="text-white/70 text-sm">
            You are signed in as {user?.primaryEmailAddress?.emailAddress}. Request admin privileges or switch to the employee or client dashboard.
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

  const stats = useMemo(() => {
    const total = state.quotes.length
    const assigned = state.quotes.filter((q) => q.status === 'assigned').length
    const inProgress = state.quotes.filter((q) => q.status === 'in_progress').length
    const completed = state.quotes.filter((q) => q.status === 'completed').length
    const intake = total - (assigned + inProgress + completed)
    const totalValue = state.quotes.reduce((acc, item) => acc + (item.value || 0), 0)
    const avgProgress = total ? Math.round(state.quotes.reduce((acc, item) => acc + (item.progress || 0), 0) / total) : 0
    return { total, assigned, inProgress, completed, intake, totalValue, avgProgress }
  }, [state.quotes])

  const handleAssign = (quoteId) => {
    const draft = drafts[quoteId]
    if (!draft?.employeeId) return
    const value = Number(draft.value)
    if (!Number.isFinite(value) || value <= 0) return
    assignQuote({ quoteId, employeeId: draft.employeeId, value })
  }

  const handleStageAdvance = (quoteId, status) => {
    updateQuoteStatus({ quoteId, status })
    const quote = state.quotes.find((item) => item.id === quoteId)
    if (quote) {
      const message = status === 'completed'
        ? 'Admin confirmed delivery and archived assets.'
        : 'Admin advanced the schedule from the control room.'
      addManualUpdate({ quoteId, message, status })
    }
  }

  const handleProgressSave = (quoteId) => {
    const draft = drafts[quoteId]
    if (!draft) return
    updateProjectTimeline({
      quoteId,
      changes: {
        progress: Number.isFinite(draft.progress) ? draft.progress : undefined,
        stageLabel: draft.stageLabel,
        estimatedDelivery: draft.estimatedDelivery,
        fileStatus: draft.fileStatus,
        value: draft.value && Number.isFinite(draft.value) ? draft.value : undefined
      }
    })
    setDrafts((prev) => ({ ...prev, [quoteId]: { ...draft, dirty: false } }))
  }

  const handleAverageSubmit = (event) => {
    event.preventDefault()
    if (!averageDraft) return
    updateAverageTurnaround(averageDraft)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-night via-[#0f1626] to-night text-white">
      <header className="border-b border-white/10 backdrop-blur-md bg-night/70">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/60">Command Center</p>
            <h1 className="text-3xl font-semibold mt-2">Admin Mission Portal</h1>
            <p className="text-sm text-white/70 mt-1">
              Monitor every intake, assign specialists, and adjust delivery metrics without leaving the dashboard.
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

        <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <motion.div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Quote Intake Queue</h2>
                <p className="text-sm text-white/60">
                  Assign missions to specialists, update stages, and manage delivery timelines at speed.
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-white/40">{stats.total} requests</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-white/60 uppercase tracking-[0.27em] text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Client</th>
                    <th className="px-4 py-3 text-left">Project</th>
                    <th className="px-4 py-3 text-left">Control</th>
                    <th className="px-4 py-3 text-left">Delivery</th>
                    <th className="px-4 py-3 text-left">Value</th>
                    <th className="px-4 py-3 text-left">Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {state.quotes.map((quote) => {
                    const draft = drafts[quote.id] || {
                      employeeId: quote.assignedTo || '',
                      value: quote.value,
                      progress: quote.progress,
                      stageLabel: quote.stageLabel,
                      fileStatus: quote.fileStatus,
                      estimatedDelivery: quote.estimatedDelivery?.slice(0, 10)
                    }
                    const employee = state.employees.find((emp) => emp.id === quote.assignedTo)
                    const client = state.clients.find((c) => c.activeProjectId === quote.id)
                    const assetDraft = assetDrafts[quote.id] || { label: '', href: '', size: '', notes: '' }

                    const onDraftChange = (changes) => {
                      setDrafts((prev) => ({
                        ...prev,
                        [quote.id]: { ...draft, ...changes, dirty: true }
                      }))
                    }

                    const onAssetDraftChange = (changes) => {
                      setAssetDrafts((prev) => ({
                        ...prev,
                        [quote.id]: { ...assetDraft, ...changes }
                      }))
                    }

                    const handleAssetSave = () => {
                      if (!assetDraft.label || !assetDraft.href) return
                      attachFinalAsset({
                        quoteId: quote.id,
                        asset: {
                          id: `${quote.id}-asset-${Date.now()}`,
                          label: assetDraft.label,
                          href: assetDraft.href,
                          size: assetDraft.size || '',
                          notes: assetDraft.notes || '',
                          uploadedAt: new Date().toISOString(),
                          uploadedBy: adminName
                        }
                      })
                      addManualUpdate({
                        quoteId: quote.id,
                        message: 'Admin uploaded final delivery assets for client review.',
                        status: quote.status
                      })
                      setAssetDrafts((prev) => ({
                        ...prev,
                        [quote.id]: { label: '', href: '', size: '', notes: '' }
                      }))
                    }

                    return (
                      <tr key={quote.id} className="odd:bg-white/[0.03] even:bg-white/[0.015]">
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium">{quote.name}</div>
                          <div className="text-xs text-white/50">{quote.email}</div>
                          {client?.logoPreferences && (
                            <div className="text-xs text-white/45 mt-2">Logo pref: {client.logoPreferences}</div>
                          )}
                          <div className="text-xs text-white/50 mt-1">Filed {new Date(quote.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4 align-top w-64">
                          <div className="font-medium">{quote.projectType}</div>
                          {quote.notes && (
                            <p className="text-xs text-white/60 mt-2 whitespace-pre-line">{quote.notes}</p>
                          )}
                          <div className="mt-3 text-xs text-white/50">Stage: {quote.stageLabel}</div>
                          <div className="mt-1 text-xs text-white/50">Status: {quote.status.replace('_', ' ')}</div>
                        </td>
                        <td className="px-4 py-4 align-top w-60">
                          <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">Progress</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={draft.progress ?? 0}
                            onChange={(event) => onDraftChange({ progress: Number(event.target.value) })}
                            className="w-full"
                          />
                          <div className="text-xs text-white/60 mt-1">{draft.progress ?? quote.progress}%</div>
                          <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mt-4 mb-1">Stage label</label>
                          <select
                            value={draft.stageLabel}
                            onChange={(event) => onDraftChange({ stageLabel: event.target.value })}
                            className="w-full dropdown-field border border-white/15 rounded-md px-3 py-2 text-sm text-black"
                          >
                            {stageOptions.map((option) => (
                              <option key={option.value} value={option.label}>{option.label}</option>
                            ))}
                          </select>
                          <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mt-4 mb-1">File status</label>
                          <select
                            value={draft.fileStatus}
                            onChange={(event) => onDraftChange({ fileStatus: event.target.value })}
                            className="w-full dropdown-field border border-white/15 rounded-md px-3 py-2 text-sm text-black"
                          >
                            {fileStatusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 align-top w-52 space-y-3">
                          <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">ETA</label>
                          <input
                            type="date"
                            value={draft.estimatedDelivery || ''}
                            onChange={(event) => onDraftChange({ estimatedDelivery: event.target.value })}
                            className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
                          />
                          <div className="text-xs text-white/50">
                            Last update {new Date(quote.lastUpdate).toLocaleString()}
                          </div>
                          <div className="flex gap-2 text-xs">
                            <button
                              onClick={() => handleStageAdvance(quote.id, 'in_progress')}
                              className="flex-1 rounded-md bg-white/10 px-3 py-2 hover:bg-white/15"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => handleStageAdvance(quote.id, 'completed')}
                              className="flex-1 rounded-md bg-accent-blue/20 px-3 py-2 hover:bg-accent-blue/30"
                            >
                              Close
                            </button>
                          </div>
                          <button
                            onClick={() => handleProgressSave(quote.id)}
                            className="w-full rounded-md bg-emerald-500/25 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-emerald-500/35"
                          >
                            Save updates
                          </button>
                        </td>
                        <td className="px-4 py-4 align-top w-44">
                          <div className="text-lg font-semibold text-white">${(draft.value ?? quote.value).toLocaleString(undefined, { minimumFractionDigits: 0 })}</div>
                          <div className="text-xs text-white/50">Employee +${quote.commission.toFixed(2)}</div>
                          <input
                            type="number"
                            min="0"
                            value={draft.value ?? quote.value}
                            onChange={(event) => onDraftChange({ value: Number(event.target.value) })}
                            className="mt-3 w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
                          />
                        </td>
                        <td className="px-4 py-4 align-top w-60">
                          <div className="space-y-2">
                            <select
                              value={draft.employeeId}
                              onChange={(event) => onDraftChange({ employeeId: event.target.value })}
                              className="w-full dropdown-field border border-white/20 rounded-md px-3 py-2 text-sm text-black"
                            >
                              <option value="">Select crew lead</option>
                              {state.employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssign(quote.id)}
                              className="w-full rounded-md bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white/20"
                            >
                              Assign mission
                            </button>
                            <div className="text-xs text-white/50">
                              {employee ? `Lead: ${employee.name}` : 'Unassigned'}
                            </div>
                            {quote.finalAssets?.length ? (
                              <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Final assets</p>
                                <ul className="space-y-1">
                                  {quote.finalAssets.map((asset) => (
                                    <li key={asset.id} className="flex items-center justify-between gap-2 text-xs text-white/70">
                                      <a
                                        href={asset.href}
                                        className="inline-flex items-center gap-1 text-accent-blue hover:text-white transition"
                                        download
                                      >
                                        <Download className="h-3 w-3" /> {asset.label || 'Download'}
                                      </a>
                                      <span className="text-[10px] text-white/40">{asset.size || ''}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Attach final asset</p>
                              <input
                                value={assetDraft.label}
                                onChange={(event) => onAssetDraftChange({ label: event.target.value })}
                                placeholder="Label"
                                className="w-full rounded-md px-3 py-2 text-xs border border-white/15 bg-white text-night"
                              />
                              <input
                                value={assetDraft.href}
                                onChange={(event) => onAssetDraftChange({ href: event.target.value })}
                                placeholder="https://file-link"
                                className="w-full rounded-md px-3 py-2 text-xs border border-white/15 bg-white text-night"
                              />
                              <div className="flex gap-2">
                                <input
                                  value={assetDraft.size}
                                  onChange={(event) => onAssetDraftChange({ size: event.target.value })}
                                  placeholder="Size (optional)"
                                  className="w-1/2 rounded-md px-3 py-2 text-xs border border-white/15 bg-white text-night"
                                />
                                <input
                                  value={assetDraft.notes}
                                  onChange={(event) => onAssetDraftChange({ notes: event.target.value })}
                                  placeholder="Notes (optional)"
                                  className="w-1/2 rounded-md px-3 py-2 text-xs border border-white/15 bg-white text-night"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={handleAssetSave}
                                className={`w-full rounded-md px-3 py-2 text-xs uppercase tracking-[0.3em] transition ${assetDraft.label && assetDraft.href ? 'bg-accent-blue/30 hover:bg-accent-blue/40 text-white' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                                disabled={!assetDraft.label || !assetDraft.href}
                              >
                                Publish asset
                              </button>
                            </div>
                          </div>
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
          </motion.div>

          <motion.div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <Gauge className="h-10 w-10 text-accent-amber" />
              <div>
                <h2 className="text-lg font-semibold">Average Turnaround</h2>
                <p className="text-xs text-white/60">
                  Update the home hero metric to reflect real workload velocity.
                </p>
              </div>
            </div>
            <form onSubmit={handleAverageSubmit} className="space-y-3">
              <input
                value={averageDraft}
                onChange={(event) => setAverageDraft(event.target.value)}
                className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
                placeholder="Example: 4-6 days"
              />
              <button type="submit" className="w-full rounded-md bg-accent-blue/30 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-accent-blue/40">
                Publish metric
              </button>
              <p className="text-xs text-white/50">Live metric: {state.averageTurnaround}</p>
            </form>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60 space-y-1">
              <p>Total pipeline value: ${stats.totalValue.toLocaleString()}</p>
              <p>Average progress: {stats.avgProgress}%</p>
            </div>
          </motion.div>
        </section>

        <EmployeeProductivity employees={state.employees} quotes={state.quotes} onAdd={addEmployee} onUpdate={updateEmployee} onRemove={removeEmployee} />

        <ClientDirectory
          clients={state.clients}
          quotes={state.quotes}
          onAdd={addClient}
          onUpdate={updateClient}
          onDelete={deleteClient}
        />

        <PortfolioManager
          portfolio={state.portfolio}
          onUpdate={updatePortfolioItem}
          onAdd={addPortfolioItem}
          onRemove={removePortfolioItem}
        />

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
function EmployeeProductivity({ employees, quotes, onAdd, onUpdate, onRemove }) {
  const [form, setForm] = useState({ name: '', email: '', specialty: '' })

  const assignmentsMap = useMemo(() => {
    return employees.map((emp) => {
      const assignments = quotes.filter((quote) => quote.assignedTo === emp.id)
      const active = assignments.filter((quote) => quote.status !== 'completed')
      const latest = assignments.reduce((acc, quote) => {
        if (!acc) return quote
        return new Date(quote.lastUpdate) > new Date(acc.lastUpdate) ? quote : acc
      }, null)
      const avgProgress = assignments.length
        ? Math.round(assignments.reduce((sum, item) => sum + (item.progress || 0), 0) / assignments.length)
        : 0
      return {
        employee: emp,
        assignments,
        active,
        latest,
        avgProgress
      }
    })
  }, [employees, quotes])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name || !form.email) return
    const payload = {
      id: `emp-${Date.now()}`,
      name: form.name,
      email: form.email,
      specialty: form.specialty
    }
    onAdd(payload)
    setForm({ name: '', email: '', specialty: '' })
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-10 w-10 text-accent-blue" />
        <div>
          <h2 className="text-lg font-semibold">Employee Productivity</h2>
          <p className="text-sm text-white/60">Track velocity, lifetime earnings, and last activity across the crew.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {assignmentsMap.map(({ employee, assignments, active, latest, avgProgress }) => (
          <motion.div
            key={employee.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{employee.name}</h3>
                <p className="text-sm text-white/60">{employee.specialty}</p>
                <p className="text-xs text-white/50">{employee.email}</p>
              </div>
              <button
                onClick={() => onRemove({ id: employee.id })}
                className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <MetricBlock label="Assignments" value={assignments.length} />
              <MetricBlock label="Active" value={active.length} />
              <MetricBlock label="Avg progress" value={`${avgProgress}%`} />
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60 space-y-2">
              <p>Wallet: ${employee.balance.toFixed(2)}</p>
              <p>Lifetime earned: ${employee.lifetimeEarned.toFixed(2)}</p>
              <p>Last activity: {employee.lastActivity ? new Date(employee.lastActivity).toLocaleString() : 'Pending'}</p>
            </div>
            {latest && (
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-xs text-white/70 space-y-2">
                <p className="uppercase tracking-[0.3em] text-white/40">Latest touch</p>
                <p>{latest.projectType} · {latest.stageLabel}</p>
                <p>{latest.updates[0]?.message}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <form className="rounded-3xl border border-dashed border-white/20 p-6 grid gap-4 sm:grid-cols-4" onSubmit={handleSubmit}>
        <div className="sm:col-span-4 text-sm text-white/60">Add crew member</div>
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Name"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
          required
        />
        <input
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Email"
          type="email"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
          required
        />
        <input
          value={form.specialty}
          onChange={(event) => setForm((prev) => ({ ...prev, specialty: event.target.value }))}
          placeholder="Specialty"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
        />
        <button
          type="submit"
          className="rounded-md bg-accent-blue/30 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-accent-blue/40"
        >
          Add employee
        </button>
      </form>
    </section>
  )
}
function MetricBlock({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-3">
      <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="text-sm mt-1 text-white">{value}</p>
    </div>
  )
}
function ClientDirectory({ clients, quotes, onAdd, onUpdate, onDelete }) {
  const [form, setForm] = useState({ name: '', email: '', company: '', logoPreferences: '', notes: '' })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name || !form.email) return
    onAdd({ ...form })
    setForm({ name: '', email: '', company: '', logoPreferences: '', notes: '' })
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderCog className="h-10 w-10 text-accent-blue" />
        <div>
          <h2 className="text-lg font-semibold">Client Directory</h2>
          <p className="text-sm text-white/60">Maintain access rules, track logo preferences, and push staged updates.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {clients.map((client) => {
          const project = quotes.find((quote) => quote.id === client.activeProjectId)
          return (
            <motion.div
              key={client.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{client.name}</h3>
                  <p className="text-sm text-white/60">{client.company}</p>
                  <p className="text-xs text-white/50">{client.email}</p>
                </div>
                <button
                  onClick={() => onDelete({ id: client.id })}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
                >
                  Remove
                </button>
              </div>
              <div className="text-xs text-white/60 space-y-1">
                <p>Stage: {client.stage}</p>
                <p>Last update: {client.lastUpdate ? new Date(client.lastUpdate).toLocaleString() : 'Pending'}</p>
                <p>Logo pref: {client.logoPreferences || 'Not set'}</p>
              </div>
              <textarea
                value={client.notes || ''}
                onChange={(event) => onUpdate({ id: client.id, changes: { notes: event.target.value } })}
                className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
                placeholder="Client notes"
              />
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Downloads enabled</span>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(client.allowDownloads)}
                    onChange={(event) => onUpdate({ id: client.id, changes: { allowDownloads: event.target.checked } })}
                  />
                  {client.allowDownloads ? 'Yes' : 'No'}
                </label>
              </div>
              {project && (
                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 text-xs text-white/70 space-y-2">
                  <p className="uppercase tracking-[0.3em] text-white/40">Active Project</p>
                  <p>{project.projectType}</p>
                  <p>{project.stageLabel} · {project.progress}%</p>
                  <p>Next update: {project.estimatedDelivery ? new Date(project.estimatedDelivery).toLocaleDateString() : 'Pending'}</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <form className="rounded-3xl border border-dashed border-white/20 p-6 grid gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
        <div className="sm:col-span-3 text-sm text-white/60">Add client</div>
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Name"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
          required
        />
        <input
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Email"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
          type="email"
          required
        />
        <input
          value={form.company}
          onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
          placeholder="Company"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
        />
        <textarea
          value={form.logoPreferences}
          onChange={(event) => setForm((prev) => ({ ...prev, logoPreferences: event.target.value }))}
          placeholder="Logo preferences"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night sm:col-span-3"
          rows={2}
        />
        <textarea
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Notes"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night sm:col-span-3"
          rows={2}
        />
        <button
          type="submit"
          className="sm:col-span-3 rounded-md bg-accent-blue/30 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-accent-blue/40"
        >
          Add client
        </button>
      </form>
    </section>
  )
}
function PortfolioManager({ portfolio, onUpdate, onAdd, onRemove }) {
  const [form, setForm] = useState({ title: '', tag: 'Showcase', description: '', image: '', aspectRatio: '' })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.title || !form.image) return
    onAdd({ ...form })
    setForm({ title: '', description: '', image: '' })
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <ImagePlus className="h-10 w-10 text-accent-blue" />
        <div>
          <h2 className="text-lg font-semibold">Portfolio Manager</h2>
          <p className="text-sm text-white/60">Swap or relabel showcase visuals without touching the codebase.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {portfolio.map((item) => (
          <motion.div
            key={item.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-xs text-white/50">Last updated {new Date(item.updatedAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
              >
                Remove
              </button>
            </div>
            <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">Image path</label>
            <input
              value={item.image}
              onChange={(event) => onUpdate({ id: item.id, changes: { image: event.target.value } })}
              className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
            />
            <label className="block text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">Description</label>
            <textarea
              value={item.description}
              onChange={(event) => onUpdate({ id: item.id, changes: { description: event.target.value } })}
              className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
              rows={2}
            />
          </motion.div>
        ))}
      </div>

      <form className="rounded-3xl border border-dashed border-white/20 p-6 grid gap-4" onSubmit={handleSubmit}>
        <div className="text-sm text-white/60">Add showcase visual</div>
        <input
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          placeholder="Title"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
          required
        />
        <textarea
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Description"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
          rows={2}
        />
        <input
          value={form.image}
          onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
          placeholder="/images/example.png"
          className="rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
          required
        />
        <button
          type="submit"
          className="rounded-md bg-accent-blue/30 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-accent-blue/40"
        >
          Add visual
        </button>
      </form>
    </section>
  )
}



