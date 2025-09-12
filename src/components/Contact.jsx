import React from 'react'

export default function Contact() {
  const [rush, setRush] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const widgetIdRef = React.useRef(null)

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    const form = new FormData(e.currentTarget)

    // Honeypot check
    if (form.get('company')) {
      setStatus({ ok: false, msg: 'Spam detected.' })
      setSubmitting(false)
      return
    }

    // placeholder POST to future backend endpoint
    try {
      // Collect reCAPTCHA token if widget mounted
      if (widgetIdRef.current && window.grecaptcha) {
        const token = window.grecaptcha.getResponse(widgetIdRef.current)
        if (token) form.set('recaptcha', token)
      }

      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form))
      })
      if (!res.ok) throw new Error('Network error')
      setStatus({ ok: true, msg: 'Request received. We will respond shortly.' })
      e.currentTarget.reset()
      setRush(false)
    } catch (err) {
      // Until backend exists, treat as success for UX demo
      setStatus({ ok: true, msg: 'Request received (demo). Backend hookup pending.' })
    } finally {
      setSubmitting(false)
    }
  }

  React.useEffect(() => {
    let canceled = false
    async function run() {
      if (!siteKey) return
      const { mountRecaptcha } = await import('../utils/recaptcha')
      if (!canceled) {
        try {
          const id = await mountRecaptcha('recaptcha-container', siteKey)
          widgetIdRef.current = id
        } catch {}
      }
    }
    run()
    return () => { canceled = true }
  }, [siteKey])

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 id="contact-title" className="text-2xl sm:text-3xl font-semibold tracking-tight">Request a Quote</h2>
            <p className="text-white/70 mt-3 text-sm max-w-prose">
              Styled like a professional quote. This form posts to a backend endpoint you can deploy later. Includes honeypot spam protection and optional reCAPTCHA (env-based).
            </p>
            <ul className="mt-6 text-sm text-white/80 space-y-2">
              <li>• Name, Email, Project Type</li>
              <li>• Optional Rush (+$400, 4–7 days)</li>
              <li>• Optional Notes</li>
            </ul>
          </div>

          <form onSubmit={onSubmit} className="rounded-2xl glass border border-glass p-6" aria-describedby="contact-help">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm mb-1">Name</label>
                <input id="name" name="name" required autoComplete="name" className="w-full bg-white/5 border-white/15 rounded-md focus:ring-accent-blue focus:border-accent-blue" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm mb-1">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" className="w-full bg-white/5 border-white/15 rounded-md focus:ring-accent-blue focus:border-accent-blue" />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="projectType" className="block text-sm mb-1">Project Type</label>
              <select id="projectType" name="projectType" required className="w-full bg-white/5 border-white/15 rounded-md focus:ring-accent-blue focus:border-accent-blue">
                <option value="Logo">Logo Design</option>
                <option value="Brand Identity">Brand Identity Kit</option>
                <option value="Social Pack">Social Media Pack</option>
                <option value="Retainer">Monthly Retainer</option>
              </select>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <input id="rush" name="rush" type="checkbox" className="rounded border-white/20 text-accent-amber focus:ring-accent-amber" onChange={(e) => setRush(e.target.checked)} />
              <label htmlFor="rush" className="text-sm">Rush (+$400, 4–7 day turnaround)</label>
            </div>
            {rush && (
              <div className="mt-2 text-xs text-accent-amber/80">Rush selected. $400 will be added to your quote.</div>
            )}
            <div className="mt-4">
              <label htmlFor="notes" className="block text-sm mb-1">Notes (optional)</label>
              <textarea id="notes" name="notes" rows={4} className="w-full bg-white/5 border-white/15 rounded-md focus:ring-accent-blue focus:border-accent-blue" placeholder="Goals, references, brand voice..." />
            </div>
            {/* Honeypot */}
            <div className="hidden" aria-hidden>
              <label htmlFor="company">Company</label>
              <input id="company" name="company" tabIndex={-1} autoComplete="off" />
            </div>

            {/* Placeholder for optional reCAPTCHA site key (inject if VITE_RECAPTCHA_SITE_KEY set) */}
            <div id="recaptcha-container" className="mt-4" />

            <div className="mt-6">
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-white/10 border border-white/15 hover:border-accent-blue/50 hover:shadow-glow text-sm tracking-widest uppercase disabled:opacity-60">
                {submitting ? 'Sending…' : 'Request Quote'}
              </button>
            </div>
            <p id="contact-help" className="sr-only">All fields required except notes.</p>
            {status && (
              <div className={`mt-4 text-sm ${status.ok ? 'text-accent-blue' : 'text-red-400'}`}>{status.msg}</div>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
