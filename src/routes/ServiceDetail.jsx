import React from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Workflow } from 'lucide-react'

const serviceContent = {
  'logo-design': {
    title: 'Logo Design',
    hero: 'Mission-ready marks built to read in a split second and embed in memory.',
    color: 'from-accent-blue to-accent-amber',
    pillars: [
      { label: 'Discovery Sprints', body: 'Rapid interviews and archive sweeps capture voice, context, and performance targets before any sketch begins.' },
      { label: 'Vector Arsenal', body: 'Every mark ships with responsive variants, monochrome stacks, and mission badge lockups optimised for your digital stack.' },
      { label: 'Battle Testing', body: 'Logos are validated across print, merch, and UI mockups with simulated wear so you know exactly how they hold up in the field.' }
    ]
  },
  'brand-identity-kits': {
    title: 'Brand Identity Kits',
    hero: 'A complete visual doctrine: typography, color theory, grids, motion, and usage guardrails.',
    color: 'from-purple-400 to-accent-amber',
    pillars: [
      { label: 'Adaptive Systems', body: 'Build responsive components that flex from hero billboards to app micro copy without losing coherence.' },
      { label: 'Playbooks', body: 'Deployment manuals translate the system to internal teams with pacing, photography direction, and QA checklists.' },
      { label: 'Motion & Sound', body: 'Optional kinetic signatures and sonic cues ensure your brand carries presence even in silent scroll moments.' }
    ]
  },
  'social-media-packs': {
    title: 'Social Media Packs',
    hero: 'Pre-built campaign kits and AI prompt libraries to keep feeds reporting for duty every day.',
    color: 'from-green-400 to-cyan-400',
    pillars: [
      { label: 'Template Command', body: 'Layered Figma and Adobe templates for reels, carousels, paid ads, and community check-ins accelerate production cycles.' },
      { label: 'Prompt Vault', body: 'Role-specific AI prompts generate caption drafts, hashtag clusters, and narrative hooks tuned to your personas.' },
      { label: 'Signals Dashboard', body: 'Optional analytics overlays show which creative assets are spiking engagement so you can redeploy instantly.' }
    ]
  },
  'monthly-retainers': {
    title: 'Monthly Retainers',
    hero: 'Dedicated creative squad on tap with SLA-backed response times and quarterly strategy syncs.',
    color: 'from-amber-400 to-rose-400',
    pillars: [
      { label: 'Priority Queue', body: 'Requests enter a private mission board with guaranteed touchpoints inside 24 hours and status pings every step.' },
      { label: 'Revenue Alignment', body: 'Monthly retros connect creative output to pipeline metrics so we can re-task campaigns toward proven wins.' },
      { label: 'Special Ops', body: 'Need product launch kits or investor decks? Retainers include emergency sprints for high-stakes drops.' }
    ]
  }
}

const timeline = ['Briefing', 'Concept Lab', 'Iteration Live Fire', 'Refinement', 'Deployment']

export default function ServiceDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const data = serviceContent[slug]

  if (!data) {
    navigate('/#services', { replace: true })
    return null
  }

  const handleBack = () => {
    const fallback = '/#services'
    const previous = (location.state && location.state.from) || fallback
    navigate(previous, { replace: previous === fallback })
  }

  return (
    <div className="min-h-screen bg-night text-white">
      <Helmet>
        <title>{`${data.title} - VetWraps Mission Services`}</title>
        <meta name="description" content={data.hero} />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <motion.div
            className={`rounded-3xl border border-white/10 bg-gradient-to-br ${data.color} p-[1px]`}
            initial={{ scale: 0.97 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="rounded-3xl bg-night/95 p-8 sm:p-10">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{data.title}</h1>
              <p className="mt-4 text-white/75 text-lg leading-relaxed max-w-3xl">{data.hero}</p>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            {data.pillars.map((pillar, index) => (
              <motion.div
                key={pillar.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                variants={{ hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } }}
                transition={{ delay: index * 0.12, duration: 0.65, ease: 'easeOut' }}
              >
                <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">{pillar.label}</h2>
                <p className="mt-3 text-sm text-white/75 leading-relaxed">{pillar.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/60">Production Timeline</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {timeline.map((step, index) => (
              <motion.div
                key={step}
                className="rounded-2xl border border-white/10 bg-night/70 p-4 text-center"
                whileHover={{ y: -6, boxShadow: '0 18px 36px rgba(15,25,45,0.35)' }}
              >
                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.25em] text-white/50">
                  <Sparkles className="h-3.5 w-3.5" />
                  Step {index + 1}
                </div>
                <p className="mt-3 text-sm font-medium text-white">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <Workflow className="h-5 w-5 text-accent-blue" />
              <span>Request a deeper operations walkthrough</span>
            </div>
            <Link
              to="/client"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white hover:border-white/40 transition"
            >
              Preview Client Dashboard
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-night/70 p-5">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/60">Deliverables</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li>- Full asset kit packaged for print, web, and motion</li>
                <li>- AI generated briefing recaps for internal distribution</li>
                <li>- Post-launch support window with analytics snippets</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-night/70 p-5">
              <h3 className="text-sm uppercase tracking-[0.3em] text-white/60">Signal Boosters</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/75">
                <li>- Optional on-site workshop with your marketing lead</li>
                <li>- Asset tagging so every file is searchable by mission goal</li>
                <li>- Integration with the VetWraps client tracker for live updates</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
