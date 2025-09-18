import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import { Clock, AlertCircle, Sparkles, CalendarCheck, Compass, Target } from 'lucide-react'

const stageNarratives = {
  new: 'We received your brief and the admin team is preparing the mission outline.',
  assigned: 'A specialist has accepted the mission and is assembling references.',
  in_progress: 'Design is active. Expect WIP assets and requests for feedback soon.',
  completed: 'Final deliverables approved. Files are archived and ready to deploy.'
}

export default function ClientPanel() {
  const { user, isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()
  const { state } = useDashboard()

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const projects = state.quotes.filter((quote) => quote.email.toLowerCase() === email)
  const [activeProjectId, setActiveProjectId] = React.useState(projects[0]?.id ?? null)

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  React.useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id)
    }
  }, [projects, activeProjectId])

  if (!isLoaded) {
    return <PanelLoading label="Preparing client view" />
  }

  if (!isSignedIn) {
    return <PanelLoading label="Redirecting to home" />
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-night text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-accent-amber" />
          <h1 className="text-3xl font-semibold">No projects in flight yet</h1>
          <p className="text-white/70 text-sm">
            {user?.primaryEmailAddress?.emailAddress} does not match any requests in our system. Submit a quote from the main site or contact your project manager for access.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white/15 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-night via-[#0f1828] to-night text-white">
      <header className="border-b border-white/10 backdrop-blur-md bg-night/70">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-2">
          <p className="text-xs uppercase tracking-[0.45em] text-white/60">Client View</p>
          <h1 className="text-3xl font-semibold">Live Project Tracker</h1>
          <p className="text-sm text-white/70">Monitor phase changes, percentage complete, and communication notes in real time.</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-12">
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard icon={Clock} label="Active Projects" value={projects.filter((p) => p.status !== 'completed').length} />
          <SummaryCard icon={CalendarCheck} label="Completed" value={projects.filter((p) => p.status === 'completed').length} />
          <SummaryCard icon={Sparkles} label="Next Update" value="Every 48 hrs" />
        </section>

        <section className="space-y-6">
          {projects.map((project) => {
            const isActive = project.id === activeProjectId
            return (
              <motion.div
                key={project.id}
                className={`rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 transition ${isActive ? 'ring-1 ring-accent-blue/60 shadow-[0_24px_60px_rgba(25,35,55,0.45)]' : ''}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{project.projectType}</h2>
                    <p className="text-sm text-white/60">Filed on {new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                    <span>Current stage: {project.stageLabel}</span>
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => setActiveProjectId(project.id)}
                        className="rounded-md border border-white/20 px-3 py-1 text-white/70 hover:text-white transition"
                      >
                        Set as focus
                      </button>
                    )}
                  </div>
                </header>

                <ProgressMeter percent={project.progress} />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Status</p>
                    <p className="text-lg font-semibold capitalize mt-2">{project.status.replace('_', ' ')}</p>
                    {project.assignedTo && (
                      <p className="text-xs text-white/60 mt-2">
                        Assigned specialist: {getEmployeeName(state, project.assignedTo)}
                      </p>
                    )}
                    {project.rush && <p className="text-xs text-accent-amber mt-2">Rush service activated</p>}
                  </div>
                  <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Budget Summary</p>
                    <p className="text-lg font-semibold mt-2">${project.value.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
                    <p className="text-xs text-white/60 mt-2">Team commission distributed automatically on sign-off.</p>
                  </div>
                </div>

                <Accordion updates={project.updates} projectId={project.id} />

                <div className="rounded-2xl bg-white/8 border border-white/10 p-4 text-sm text-white/70">
                  Expect a fresh update every 48 hours or faster when a milestone flips. Need something sooner? Reply to the latest email and it routes straight to the designer and admin at once.
                </div>
              </motion.div>
            )
          })}
        </section>

        <AnimatePresence>
          {activeProject && (
            <motion.section
              key={activeProject.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm space-y-6"
            >
              <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <Compass className="h-5 w-5 text-accent-blue" />
                  <span>Mission console for {activeProject.projectType}</span>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-white/50">Real-time feed</span>
              </header>
              <div className="grid gap-4 md:grid-cols-3">
                {['new', 'assigned', 'in_progress', 'completed'].map((stage) => {
                  const reached = stage === activeProject.status || stageRank(stage) <= stageRank(activeProject.status)
                  return (
                    <motion.div
                      key={stage}
                      className={`rounded-2xl border ${reached ? 'border-accent-blue/60 bg-night/70' : 'border-white/10 bg-night/60'} p-4 space-y-3`}
                      whileHover={{ y: -6 }}
                    >
                      <div className="text-xs uppercase tracking-[0.3em] text-white/50">{stage.replace('_', ' ')}</div>
                      <p className="text-sm text-white/80 leading-relaxed">{stageNarratives[stage]}</p>
                    </motion.div>
                  )
                })}
              </div>
              <div className="rounded-2xl border border-white/10 bg-night/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Latest transmissions</p>
                <motion.ul
                  className="mt-4 space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  {activeProject.updates.slice(0, 5).map((update, index) => (
                    <motion.li
                      key={update.id}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <span>{update.message}</span>
                        <span className="text-xs text-white/40">{new Date(update.timestamp).toLocaleString()}</span>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
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

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/5 p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Icon className="h-6 w-6 text-accent-blue" />
      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </motion.div>
  )
}

function ProgressMeter({ percent }) {
  return (
    <div className="space-y-2">
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-blue via-accent-amber to-accent-blue" style={{ width: `${percent}%` }} />
      </div>
      <div className="text-xs text-white/50">{percent}% complete</div>
    </div>
  )
}

function stageRank(stage) {
  if (stage === 'new') return 0
  if (stage === 'assigned') return 1
  if (stage === 'in_progress') return 2
  if (stage === 'completed') return 3
  return 0
}

function Accordion({ updates, projectId }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="rounded-2xl bg-white/8 border border-white/10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm text-white/70 hover:text-white transition"
      >
        Timeline notes
        <Target className={`h-4 w-4 transition-transform ${open ? 'rotate-45 text-accent-blue' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={projectId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden border-t border-white/10"
          >
            <ul className="space-y-2 px-4 py-4 text-sm text-white/75">
              {updates.map((update) => (
                <li key={update.id} className="rounded-lg bg-night/70 border border-white/10 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="capitalize">{update.status.replace('_', ' ')}</span>
                    <span className="text-xs text-white/40">{new Date(update.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-xs text-white/60 leading-relaxed">{update.message}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function getEmployeeName(state, employeeId) {
  const employee = state.employees.find((emp) => emp.id === employeeId)
  return employee ? employee.name : 'Pending assignment'
}
