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
- Quote form POSTs to `/api/quote` (Netlify function or custom endpoint). Add server-side validation + reCAPTCHA verification.

Structure
---------
- src/components: UI sections and widgets
- src/routes: internal pages (/subscribers, case studies, updates)
- public: og-cover.svg, robots.txt

