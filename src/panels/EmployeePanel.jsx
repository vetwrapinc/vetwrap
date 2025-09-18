import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import AIEmailComposer from './components/AIEmailComposer'
import { BadgeCheck, Coins, AlertCircle, Upload, FileText, Clock, Image as ImageIcon } from 'lucide-react'
export default function EmployeePanel() {
  const { user, isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()
  const {
    state,
    updateQuoteStatus,
    cashOutEmployee,
    updateProjectTimeline,
    upsertProjectPreview,
    addProjectMessage
  } = useDashboard()

  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
  const employee = state.employees.find((emp) => emp.email.toLowerCase() === email)

  const [progressDrafts, setProgressDrafts] = useState({})
  const [captionDrafts, setCaptionDrafts] = useState({})
  const [messageDrafts, setMessageDrafts] = useState({})
  const [pendingFiles, setPendingFiles] = useState({})
  const [uploading, setUploading] = useState({})

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

  useEffect(() => {
    setProgressDrafts((prev) => {
      const next = { ...prev }
      assignments.forEach((quote) => {
        if (typeof next[quote.id] === 'undefined') {
          next[quote.id] = quote.progress
        }
      })
      return next
    })
    setCaptionDrafts((prev) => {
      const next = { ...prev }
      assignments.forEach((quote) => {
        if (typeof next[quote.id] === 'undefined') {
          next[quote.id] = ''
        }
      })
      return next
    })
    setMessageDrafts((prev) => {
      const next = { ...prev }
      assignments.forEach((quote) => {
        if (typeof next[quote.id] === 'undefined') {
          next[quote.id] = ''
        }
      })
      return next
    })
  }, [assignments])

  const walletBalance = employee.balance
  const lifetime = employee.lifetimeEarned

  const markStatus = (quoteId, status) => {
    updateQuoteStatus({ quoteId, status })
  }

  const handleProgressChange = (quoteId, value) => {
    setProgressDrafts((prev) => ({ ...prev, [quoteId]: value }))
  }

  const handleProgressSave = (quote) => {
    const draftValue = progressDrafts[quote.id]
    updateProjectTimeline({
      quoteId: quote.id,
      changes: {
        progress: draftValue,
        stageLabel: quote.stageLabel
      }
    })
  }

  const handleFilePick = (quoteId, file) => {
    if (!file) return
    setPendingFiles((prev) => ({ ...prev, [quoteId]: file }))
  }

  const handlePreviewUpload = async (quote, fileOverride) => {
    const file = fileOverride || pendingFiles[quote.id]
    if (!file) return
    setUploading((prev) => ({ ...prev, [quote.id]: true }))
    try {
      const dataUrl = await compressImage(file)
      const preview = {
        id: `preview-${Date.now()}`,
        href: dataUrl,
        uploadedBy: employee.name,
        uploadedAt: new Date().toISOString(),
        caption: captionDrafts[quote.id] || `${quote.projectType} preview`
      }
      upsertProjectPreview({ quoteId: quote.id, preview })
      setCaptionDrafts((prev) => ({ ...prev, [quote.id]: '' }))
      setPendingFiles((prev) => {
        const next = { ...prev }
        delete next[quote.id]
        return next
      })
    } catch (error) {
      console.warn('Unable to process preview upload', error)
    } finally {
      setUploading((prev) => ({ ...prev, [quote.id]: false }))
    }
  }

  const handleMessageSend = (quote) => {
    const body = (messageDrafts[quote.id] || '').trim()
    if (!body) return
    addProjectMessage({
      quoteId: quote.id,
      message: {
        authorRole: 'employee',
        author: employee.name,
        body
      }
    })
    setMessageDrafts((prev) => ({ ...prev, [quote.id]: '' }))
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
              <p className="text-sm text-white/60">Update your progress, share previews, and keep the command center in sync.</p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">{assignments.length} assignments</span>
          </div>

          <div className="grid gap-4">
            {assignments.map((quote) => {
              const progressDraft = progressDrafts[quote.id] ?? quote.progress
              const captionDraft = captionDrafts[quote.id] ?? ''
              const messageDraft = messageDrafts[quote.id] ?? ''
              const client = state.clients.find((c) => c.activeProjectId === quote.id)
              const previews = Array.isArray(quote.previews) ? quote.previews.slice(0, 4) : []
              const pendingFile = pendingFiles[quote.id]
              const isUploading = Boolean(uploading[quote.id])

              return (
                <motion.div
                  key={quote.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{quote.projectType}</h3>
                        <p className="text-sm text-white/60">Client: {quote.name}</p>
                        <p className="text-sm text-white/60">Email: {quote.email}</p>
                        {quote.notes && <p className="text-sm text-white/55 mt-3 whitespace-pre-wrap">{quote.notes}</p>}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-accent-blue" />
                          <span>Logo pref: {client?.logoPreferences || 'Pending briefing'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-accent-blue" />
                          <span>ETA: {quote.estimatedDelivery ? new Date(quote.estimatedDelivery).toLocaleDateString() : 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-accent-blue" />
                          <span>File status: {quote.fileStatus || 'Pending'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.25em] text-white/40">Progress</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={progressDraft}
                          onChange={(event) => handleProgressChange(quote.id, Number(event.target.value))}
                          className="w-full"
                        />
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{progressDraft}%</span>
                          <button
                            type="button"
                            onClick={() => handleProgressSave(quote)}
                            className="rounded-md bg-accent-blue/25 px-3 py-1 text-[10px] uppercase tracking-[0.3em] hover:bg-accent-blue/35"
                          >
                            Log progress
                          </button>
                        </div>
                      </div>

                      {previews.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Shared previews</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {previews.map((preview) => (
                              <div key={preview.id} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
                                <img src={preview.href} alt={preview.caption || 'Preview'} className="h-24 w-full object-cover" />
                                <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70">
                                  {preview.caption || 'Preview'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Commission</p>
                        <p className="text-2xl font-semibold text-white mt-1">+${quote.commission.toFixed(2)}</p>
                        <p className="text-xs text-white/50 mt-1">Complete and mark delivered to drop this into your wallet.</p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Upload preview</p>
                        <input
                          value={captionDraft}
                          onChange={(event) => setCaptionDrafts((prev) => ({ ...prev, [quote.id]: event.target.value }))}
                          placeholder="Caption"
                          className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
                        />
                        <div className="flex items-center gap-2">
                          <label className="inline-flex items-center gap-2 rounded-md bg-white/10 border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.3em] cursor-pointer hover:bg-white/15">
                            <Upload className="h-4 w-4" />
                            Choose file
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0]
                                handleFilePick(quote.id, file)
                                event.target.value = ''
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handlePreviewUpload(quote)}
                            disabled={isUploading || !pendingFile}
                            className="flex-1 rounded-md bg-accent-blue/25 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-accent-blue/35 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploading ? 'Uploading…' : 'Send preview'}
                          </button>
                        </div>
                        {pendingFile && (
                          <p className="text-xs text-white/50">Ready: {pendingFile.name}</p>
                        )}
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Mission message</p>
                        <textarea
                          value={messageDraft}
                          onChange={(event) => setMessageDrafts((prev) => ({ ...prev, [quote.id]: event.target.value }))}
                          rows={3}
                          placeholder="Share a status update or request assets"
                          className="w-full rounded-md px-3 py-2 text-sm border border-white/20 bg-white text-night"
                        />
                        <button
                          type="button"
                          onClick={() => handleMessageSend(quote)}
                          className="w-full rounded-md bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] hover:bg-white/15"
                        >
                          Send update
                        </button>
                      </div>

                      <div className="space-y-2">
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
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
  const stages = ['new', 'assigned', 'in_progress', 'completed']
  const counts = stages.map((stage) => assignments.filter((quote) => quote.status === stage).length)
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-white/5 p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Mission distribution</p>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {stages.map((stage, index) => (
          <div key={stage} className="rounded-xl bg-white/8 border border-white/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{stage.replace('_', ' ')}</p>
            <p className="text-xl font-semibold text-white mt-2">{counts[index]}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

async function compressImage(file, maxWidth = 1280) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = maxWidth / img.width
        const width = Math.min(maxWidth, img.width)
        const height = img.width > maxWidth ? img.height * scale : img.height
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}
