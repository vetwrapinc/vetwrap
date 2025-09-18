import React, { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import AIEmailComposer from './components/AIEmailComposer'
import { BadgeCheck, Coins, AlertCircle } from 'lucide-react'

export default function EmployeePanel() {
  const { user, isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()
  const { state, updateQuoteStatus, cashOutEmployee } = useDashboard()

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const employee = state.employees.find((emp) => emp.email.toLowerCase() === email)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/', { replace: true })
    }
  }, [isLoaded, isSignedIn, navigate])

  if (!isLoaded) {
    return <PanelLoading label="Preparing crew console" />
  }

  if (!isSignedIn) {
    return <PanelLoading label="Redirecting to home" />
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-night text-white flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-accent-amber" />
          <h1 className="text-3xl font-semibold">No crew record yet</h1>
          <p className="text-white/70 text-sm">
            {user?.primaryEmailAddress?.emailAddress} is not linked to the VetWraps operations roster. Ask your admin to add your email or sign in with your issued account.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em]"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  const assignments = state.quotes.filter((quote) => quote.assignedTo === employee.id)
  const walletBalance = employee.balance
  const lifetime = employee.lifetimeEarned

  const markStatus = (quoteId, status) => {
    updateQuoteStatus({ quoteId, status })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-night via-[#101b2b] to-night text-white">
      <header className="border-b border-white/10 backdrop-blur-md bg-night/70">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/60">Crew Console</p>
            <h1 className="text-3xl font-semibold">{employee.name}</h1>
            <p className="text-sm text-white/70">{employee.specialty}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/60">
              {employee.email}
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

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-12">
        <section className="grid gap-4 md:grid-cols-2">
          <WalletCard balance={walletBalance} lifetime={lifetime} onCashOut={() => cashOutEmployee(employee.id)} />
          <MissionSummary assignments={assignments} />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Active Missions</h2>
              <p className="text-sm text-white/60">Update your status to keep clients in the loop and unlock your commission.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">{assignments.length} assignments</span>
          </div>

          <div className="grid gap-4">
            {assignments.map((quote) => (
              <motion.div
                key={quote.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 grid gap-4 md:grid-cols-[1.5fr_1fr]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h3 className="text-xl font-semibold">{quote.projectType}</h3>
                  <p className="text-sm text-white/60 mt-1">Client: {quote.name}</p>
                  <p className="text-sm text-white/60">Email: {quote.email}</p>
                  {quote.notes && <p className="text-sm text-white/55 mt-3 whitespace-pre-wrap">{quote.notes}</p>}
                  <div className="mt-4 space-y-2">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent-blue to-accent-amber" style={{ width: `${quote.progress}%` }} />
                    </div>
                    <div className="text-xs text-white/50 uppercase tracking-[0.3em]">{quote.progress}% / {quote.stageLabel}</div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Commission</p>
                    <p className="text-2xl font-semibold text-white mt-1">+${quote.commission.toFixed(2)}</p>
                    <p className="text-xs text-white/50 mt-1">Complete and mark delivered to drop this into your wallet.</p>
                  </div>
                  {quote.status === 'assigned' && (
                    <button
                      onClick={() => markStatus(quote.id, 'in_progress')}
                      className="w-full rounded-lg bg-accent-blue/20 px-4 py-2 text-xs uppercase tracking-[0.3em] hover:bg-accent-blue/30"
                    >
                      Start mission
                    </button>
                  )}
                  {quote.status === 'in_progress' && (
                    <button
                      onClick={() => markStatus(quote.id, 'completed')}
                      className="w-full rounded-lg bg-emerald-500/20 px-4 py-2 text-xs uppercase tracking-[0.3em] hover:bg-emerald-500/30"
                    >
                      Mark delivered
                    </button>
                  )}
                  {quote.status === 'completed' && (
                    <div className="inline-flex items-center gap-2 text-emerald-300 text-xs uppercase tracking-[0.3em]">
                      <BadgeCheck className="h-4 w-4" /> Complete
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {assignments.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/20 p-12 text-center text-white/50">
                No missions assigned yet. Your admin will route a brief here when the next project launches.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">AI Comms Assistant</h2>
            <p className="text-sm text-white/60">Draft replies or handoff notes without leaving the mission queue.</p>
          </div>
          <AIEmailComposer
            title="Spin Up Client Update"
            description="Generate polished updates that mirror VetWraps voice in seconds."
            defaultRecipient={assignments[0]?.name || ''}
          />
        </section>
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

function WalletCard({ balance, lifetime, onCashOut }) {
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-accent-blue/10 to-white/5 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Wallet balance</p>
          <p className="text-4xl font-semibold mt-2">${balance.toFixed(2)}</p>
        </div>
        <Coins className="h-12 w-12 text-white/70" />
      </div>
      <p className="text-xs text-white/60 mt-1">15% commission automatically tracked per mission.</p>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Lifetime earned</p>
          <p className="text-lg font-semibold">${lifetime.toFixed(2)}</p>
        </div>
        <button
          onClick={onCashOut}
          className="rounded-lg bg-white/10 border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white/15"
        >
          Cash out
        </button>
      </div>
    </motion.div>
  )
}

function MissionSummary({ assignments }) {
  const counts = assignments.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {})
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold">Mission status</h3>
      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-xl bg-white/10 border border-white/10 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Assigned</p>
          <p className="text-2xl font-semibold">{counts.assigned || 0}</p>
        </div>
        <div className="rounded-xl bg-white/10 border border-white/10 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Progress</p>
          <p className="text-2xl font-semibold">{counts.in_progress || 0}</p>
        </div>
        <div className="rounded-xl bg-white/10 border border-white/10 p-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Complete</p>
          <p className="text-2xl font-semibold">{counts.completed || 0}</p>
        </div>
      </div>
    </motion.div>
  )
}
