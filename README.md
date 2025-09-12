VetWraps — Mission-Ready Design
================================

Veteran-owned digital design studio website. Stack: React + Vite + Tailwind, icons via Lucide, animations via Framer Motion. Deploy-ready on Netlify.

Quick Start
----------
- cd vetwraps
- npm install
- npm run dev

Build & Deploy
--------------
- npm run build (outputs to `dist/`)
- Netlify config included in `netlify.toml`

Environment Vars (optional)
---------------------------
- VITE_GA_ID: Google Analytics ID (e.g., G-XXXXXXX)
- VITE_PLAUSIBLE_DOMAIN: domain for Plausible (e.g., vetwraps.com)
- VITE_AVG_TURNAROUND: overrides status widget (e.g., `3–5 days`)
- VITE_RECAPTCHA_SITE_KEY: enables client-side reCAPTCHA widget (backend verification not yet implemented)

Features
--------
- Apple-level minimalism in dark mode (#0A0A0F), white text, accent blues/orange
- Glassmorphic cards, glowing hovers, orbital gradients, schematic vectors
- Sections: Hero, Services, Why Us, Portfolio (hover-tilt), Pricing, Testimonials, Trust, Contact (quote form)
- Business add-ons: status widget, What’s New?, Case Studies, hidden /subscribers dashboard
- Accessibility: WCAG AA contrast, ARIA, skip link, keyboard focus
- SEO: meta + OpenGraph, robots.txt (noindex for /subscribers)
- Performance: preconnect fonts, lazy UI, optimized SVGs
- Security: honeypot spam protection; optional reCAPTCHA; security headers via Netlify

Backend Hookup (later)
----------------------
- Quote form POSTs to `/api/quote` (Netlify Function). Server validates inputs, verifies reCAPTCHA when configured, optionally emails and persists to DB.

Serverless Functions
--------------------
- `netlify/functions/quote.js`: Accepts quote submissions.
  - Env: `RECAPTCHA_SECRET` (Google), `EMAIL_PROVIDER` (`resend` or `sendgrid`), `RESEND_API_KEY` or `SENDGRID_API_KEY`, `QUOTE_INBOX`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE`, `SUPABASE_TABLE` (default `quotes`), `QUOTE_WEBHOOK_URL` (Slack/Discord).
- `netlify/functions/quotes-list.js`: Lists recent quotes for admins.
  - Requires Netlify Identity auth and email in `ADMIN_EMAILS` (comma-separated).

Supabase
--------
- Create the `quotes` table using `db/schema.sql`.
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` in Netlify env.

Netlify Identity
----------------
- Site settings → Identity → Enable. Invite your admin email(s).
- Set `ADMIN_EMAILS` env with allowed addresses (comma-separated).
- `/subscribers` route is gated; it lists quotes via `/api/quotes-list` when authenticated.

Sitemap
-------
- `scripts/generate-sitemap.mjs` runs after `vite build`; set `SITE_URL` env for correct canonical host.

Structure
---------
- src/components: UI sections and widgets
- src/routes: internal pages (/subscribers, case studies, updates)
- public: og-cover.svg, robots.txt
