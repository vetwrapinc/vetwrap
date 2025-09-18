import React, { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Mail, Send, Copy, Sparkles } from 'lucide-react'

function buildFallbackEmail({ recipientName, projectContext, tone }) {
  const toneLabel = tone === 'friendly' ? 'friendly' : tone === 'urgent' ? 'time-sensitive' : 'professional'
  return {
    subject: `Mission update for ${recipientName || 'your team'}`,
    plain_text: `Hi ${recipientName || 'there'},\n\n${projectContext || 'Here is the latest update on your project.'}\n\nWe are moving ahead with momentum. Expect the next checkpoint shortly.\n\nRespectfully,\nVetWraps Crew`,
    html: `<p>Hi ${recipientName || 'there'},</p><p>${projectContext || 'Here is the latest update on your project.'}</p><p>We are moving ahead with ${toneLabel} focus. Expect the next checkpoint shortly.</p><p>Respectfully,<br/>VetWraps Crew</p>`
  }
}

export default function AIEmailComposer({ title, description, defaultTone = 'professional', defaultRecipient = '' }) {
  const { getToken } = useAuth()
  const [form, setForm] = useState({
    recipient_name: defaultRecipient,
    recipient_email: '',
    tone: defaultTone,
    email_type: 'update',
    project_context: '',
    additional_notes: ''
  })
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const copyText = (text) => {
    navigator.clipboard.writeText(text)
    setMessage('Copied to clipboard')
    setTimeout(() => setMessage(''), 2400)
  }

  const generateEmail = async () => {
    if (!form.recipient_name || !form.email_type) {
      setMessage('Recipient and email type are required')
      return
    }

    setStatus('loading')
    setMessage('Generating personalised copy...')
    try {
      const token = await getToken({ template: 'integration_fallback' }).catch(() => null)
      const response = await fetch('/api/ai/email-writer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          recipient_name: form.recipient_name,
          recipient_email: form.recipient_email,
          email_type: form.email_type,
          project_context: form.project_context,
          tone: form.tone,
          additional_notes: form.additional_notes
        })
      })

      if (!response.ok) {
        throw new Error('AI service unavailable')
      }
      const data = await response.json()
      setResult({
        subject: data.subject || `Mission update for ${form.recipient_name}`,
        plain_text: data.plain_text || '',
        html: data.body || ''
      })
      setMessage('AI email ready to review')
    } catch (error) {
      console.warn('Falling back to on-device prompt:', error)
      const fallback = buildFallbackEmail({
        recipientName: form.recipient_name,
        projectContext: form.project_context,
        tone: form.tone
      })
      setResult(fallback)
      setMessage('Generated fallback email using on-device prompt')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="rounded-3xl glass border border-white/10 p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent-amber" />
            {title}
          </h3>
          <p className="text-sm text-white/70 mt-1">{description}</p>
          {message && <p className="text-xs text-accent-blue mt-2">{message}</p>}
        </div>
        <motion.div
          className="w-12 h-12 rounded-full bg-white/10 border border-white/10 grid place-items-center"
          animate={{ rotate: status === 'loading' ? 360 : 0 }}
          transition={{ repeat: status === 'loading' ? Infinity : 0, duration: 2, ease: 'linear' }}
        >
          <Mail className="h-5 w-5 text-white/80" />
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Recipient name</label>
            <input
              name="recipient_name"
              value={form.recipient_name}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white"
              placeholder="Jordan"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Recipient email</label>
            <input
              name="recipient_email"
              type="email"
              value={form.recipient_email}
              onChange={handleChange}
              className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white"
              placeholder="jordan@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Email type</label>
              <select
                name="email_type"
                value={form.email_type}
                onChange={handleChange}
                className="w-full dropdown-field border border-white/20 rounded-md px-3 py-2 text-sm font-medium"
              >
                <option value="update">Status Update</option>
                <option value="handoff">Handoff Summary</option>
                <option value="follow_up">Follow Up</option>
                <option value="checkpoint">Checkpoint Recap</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Tone</label>
              <select
                name="tone"
                value={form.tone}
                onChange={handleChange}
                className="w-full dropdown-field border border-white/20 rounded-md px-3 py-2 text-sm font-medium"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="urgent">Urgent</option>
                <option value="celebratory">Celebratory</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Project context</label>
            <textarea
              name="project_context"
              value={form.project_context}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white"
              placeholder="Outline the milestone, deliverables, or blockers..."
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Additional notes</label>
            <textarea
              name="additional_notes"
              value={form.additional_notes}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg bg-white/10 border border-white/15 px-3 py-2 text-sm text-white"
              placeholder="Voice directives, bullet points, attachments..."
            />
          </div>
          <motion.button
            type="button"
            onClick={generateEmail}
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent-blue to-accent-amber px-4 py-2 text-sm font-semibold text-night shadow-glow disabled:opacity-60"
            whileHover={{ scale: status === 'loading' ? 1 : 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Send className="h-4 w-4" />
            {status === 'loading' ? 'Synthesising' : 'Generate email'}
          </motion.button>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-4">
          {result ? (
            <>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Subject</label>
                <div className="flex items-center gap-3">
                  <input
                    value={result.subject}
                    readOnly
                    className="flex-1 rounded-lg bg-white/90 px-3 py-2 text-sm text-night"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(result.subject)}
                    className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20"
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">HTML body</label>
                <div className="rounded-lg bg-white px-3 py-3 text-sm text-night max-h-48 overflow-auto border border-slate-200">
                  <div dangerouslySetInnerHTML={{ __html: result.html }} />
                </div>
                <button
                  type="button"
                  onClick={() => copyText(result.html)}
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20"
                >
                  <Copy className="h-4 w-4" /> Copy HTML
                </button>
              </div>
              {result.plain_text && (
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Plain text</label>
                  <pre className="rounded-lg bg-white/10 border border-white/15 px-3 py-3 text-xs text-white/80 max-h-40 overflow-auto whitespace-pre-wrap">
                    {result.plain_text}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyText(result.plain_text)}
                    className="mt-3 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/20"
                  >
                    <Copy className="h-4 w-4" /> Copy Plain Text
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="h-full min-h-[220px] grid place-items-center text-sm text-white/60 text-center px-4">
              Provide details on the left, then spin up on-brand messaging that you can paste into the comms thread.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
