import React, { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'
import { ShieldCheck, Users, Gauge, MessagesSquare, LogOut, Sparkles } from 'lucide-react'

const panelFeatures = [
  {
    role: 'admin',
    title: 'Admin Command',
    description: 'Assign missions, monitor budgets, broadcast AI updates.',
    points: ['Intake queue with instant assignments', 'AI email generator', 'Cash flow and team telemetry']
  },
  {
    role: 'employee',
    title: 'Crew Console',
    description: 'View assignments, mark phases, unlock commissions.',
    points: ['Stage toggles (assigned, progress, delivered)', 'Wallet with instant 15% tracking', 'AI comms assistant for client replies']
  },
  {
    role: 'client',
    title: 'Client Timeline',
    description: 'Watch progress percentages and receive context-rich updates.',
    points: ['Live stage tracker with milestones', 'Budget visibility and handoff notes', 'Update cadence with direct reply channel']
  }
]

const roleIcons = {
  admin: ShieldCheck,
  employee: Users,
  client: Gauge
}

function resolveRole(user) {
  return user?.publicMetadata?.role || user?.unsafeMetadata?.role || 'client'
}

export default function LoginPortal({ onClose, onLoginSuccess }) {
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()
  const { openSignIn, openSignUp, signOut } = useClerk()
  const { state } = useDashboard()
  const [message, setMessage] = useState('')

  const role = resolveRole(user)

  useEffect(() => {
    if (user && isLoaded) {
      onLoginSuccess?.(user)
    }
  }, [user, isLoaded, onLoginSuccess])

  const derivedStats = computeStats(role, state, user)

  const goToDashboard = () => {
    navigate(`/dashboard/${role}`)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 240 }}
          className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-night via-[#111b2d] to-night text-white shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 border border-white/10 w-11 h-11 flex items-center justify-center hover:bg-white/20"
            aria-label="Close portal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="grid lg:grid-cols-[1.2fr_1fr]">
            <div className="p-8 lg:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15 grid place-items-center">
                  <Sparkles className="h-5 w-5 text-accent-amber" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">VetWraps Access Portal</h2>
                  <p className="text-sm text-white/70">Central command for admins, crew, and clients.</p>
                </div>
              </div>

              {user ? (
                <SignedInView
                  role={role}
                  user={user}
                  stats={derivedStats}
                  onDashboard={goToDashboard}
                  onSite={() => { navigate('/'); onClose() }}
                  onSignOut={() => signOut().then(() => setMessage('Signed out'))}
                />
              ) : (
                <SignedOutView
                  onSignIn={() => openSignIn()}
                  onSignUp={() => openSignUp()}
                />
              )}

              {message && <p className="text-xs text-accent-blue">{message}</p>}
            </div>

            <div className="bg-white/5 border-l border-white/10 p-6 space-y-4">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/50">Panel Breakdown</h3>
              <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1">
                {panelFeatures.map((panel) => (
                  <motion.div
                    key={panel.role}
                    className={`rounded-2xl border border-white/10 bg-white/${role === panel.role ? '15' : '8'} p-4 space-y-3`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <RoleIcon role={panel.role} />
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/50">{panel.role}</p>
                        <h4 className="text-lg font-semibold">{panel.title}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-white/70">{panel.description}</p>
                    <ul className="space-y-2 text-xs text-white/60">
                      {panel.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full bg-accent-blue" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function SignedInView({ role, user, stats, onDashboard, onSite, onSignOut }) {
  const Icon = roleIcons[role] || Gauge
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Signed in as</p>
          <p className="text-lg font-semibold">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white/15"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 grid place-items-center">
            <Icon className="h-5 w-5 text-accent-blue" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Current role</p>
            <p className="text-lg font-semibold capitalize">{role}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white/10 border border-white/10 p-3 text-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
              <p className="text-lg font-semibold mt-1">{stat.value}</p>
              {stat.note && <p className="text-xs text-white/50 mt-1">{stat.note}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onDashboard}
          className="flex-1 rounded-lg bg-gradient-to-r from-accent-blue to-accent-amber px-4 py-3 text-sm font-semibold text-night shadow-glow"
        >
          Access your dashboard
        </button>
        <button
          onClick={onSite}
          className="flex-1 rounded-lg bg-white/10 border border-white/15 px-4 py-3 text-sm uppercase tracking-[0.3em] hover:bg-white/15"
        >
          Continue browsing
        </button>
      </div>
    </div>
  )
}

function SignedOutView({ onSignIn, onSignUp }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-white/70">Choose an access point to get started. Credentials are powered by Clerk for secure multi-role logins.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={onSignIn}
          className="rounded-lg bg-gradient-to-r from-accent-blue to-accent-amber px-4 py-3 text-sm font-semibold text-night shadow-glow"
        >
          Sign in
        </button>
        <button
          onClick={onSignUp}
          className="rounded-lg bg-white/10 border border-white/15 px-4 py-3 text-sm uppercase tracking-[0.3em] hover:bg-white/15"
        >
          Create account
        </button>
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-xs text-white/60 space-y-2">
        <p>- Admins route incoming requests, assign specialists, and dispatch AI comms.</p>
        <p>- Employees see assigned, in progress, and completed missions with commission tracking.</p>
        <p>- Clients view live project percentages, design stages, and update transcripts.</p>
      </div>
    </div>
  )
}

function RoleIcon({ role }) {
  const Icon = roleIcons[role] || MessagesSquare
  return (
    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 grid place-items-center">
      <Icon className="h-5 w-5 text-white" />
    </div>
  )
}

function computeStats(role, state, user) {
  if (role === 'admin') {
    return [
      { label: 'New', value: state.quotes.filter((q) => q.status === 'new').length },
      { label: 'Assigned', value: state.quotes.filter((q) => q.status === 'assigned').length },
      { label: 'In progress', value: state.quotes.filter((q) => q.status === 'in_progress').length }
    ]
  }
  if (role === 'employee') {
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
    const employee = state.employees.find((emp) => emp.email.toLowerCase() === email)
    const assignments = state.quotes.filter((q) => q.assignedTo === employee?.id)
    return [
      { label: 'Missions', value: assignments.length },
      { label: 'Wallet', value: `$${(employee?.balance ?? 0).toFixed(2)}` },
      { label: 'Lifetime', value: `$${(employee?.lifetimeEarned ?? 0).toFixed(2)}` }
    ]
  }
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const projects = state.quotes.filter((q) => q.email.toLowerCase() === email)
  const active = projects.filter((q) => q.status !== 'completed')
  const averageProgress = active.length
    ? Math.round(active.reduce((acc, item) => acc + item.progress, 0) / active.length)
    : 0
  return [
    { label: 'Active projects', value: active.length },
    { label: 'Avg progress', value: `${averageProgress}%` },
    { label: 'Completed', value: projects.filter((q) => q.status === 'completed').length }
  ]
}
