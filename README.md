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
  - Requires a portal session token with admin role and email in `ADMIN_EMAILS` (comma-separated).

Supabase
--------
- Create the `quotes` table using `db/schema.sql`.
- The same schema defines `portal_users` (role-aware accounts) and `portal_assignments` (client ↔ employee pairing).
- Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` in Netlify env.

Portal Authentication
---------------------
- `/subscribers` now hosts the VetWraps Portal for admins, employees, and clients.
- Set `PORTAL_TOKEN_SECRET` (fallbacks to `ADMIN_TOKEN_SECRET`) to encrypt login tokens.
- Seed Supabase with at least one admin row in `portal_users` (hash passwords with `node -e "console.log(require('bcryptjs').hashSync('TempPass123', 12))"`).
- Admin addresses must still be included in `ADMIN_EMAILS` for quote management endpoints.
- Admins can add users and assign clients to employees directly from the portal UI.

AI Email Generator
------------------
- Optional env: `AI_EMAIL_API_KEY` or `OPENAI_API_KEY` (plus `AI_EMAIL_MODEL`).
- Without a key the server falls back to an on-device templated draft so the tool remains useful offline.

Sitemap
-------
- `scripts/generate-sitemap.mjs` runs after `vite build`; set `SITE_URL` env for correct canonical host.

Structure
---------
- src/components: UI sections and widgets
- src/routes: internal pages (/subscribers, case studies, updates)
- public: og-cover.svg, robots.txt
