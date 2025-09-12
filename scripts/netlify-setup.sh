#!/usr/bin/env bash
set -euo pipefail

echo "Setting up Netlify environment for VetWraps..."

if ! command -v netlify >/dev/null 2>&1; then
  echo "Netlify CLI not found. Installing locally with npx..."
  npm i -g netlify-cli >/dev/null 2>&1 || true
fi

netlify login
netlify link

read -rp "SITE_URL (e.g., https://vetwraps.com): " SITE_URL
read -rp "ADMIN_EMAILS (comma-separated): " ADMIN_EMAILS
read -rp "SUPABASE_URL (blank to skip DB): " SUPABASE_URL
read -rp "SUPABASE_SERVICE_ROLE (blank to skip DB): " SUPABASE_SERVICE_ROLE
read -rp "SUPABASE_TABLE [quotes]: " SUPABASE_TABLE
SUPABASE_TABLE=${SUPABASE_TABLE:-quotes}
read -rp "QUOTE_INBOX (blank skips email): " QUOTE_INBOX
read -rp "EMAIL_PROVIDER (resend/sendgrid, blank skips): " EMAIL_PROVIDER
read -rp "RESEND_API_KEY (blank skips): " RESEND_API_KEY
read -rp "SENDGRID_API_KEY (blank skips): " SENDGRID_API_KEY
read -rp "VITE_GA_ID (optional): " VITE_GA_ID
read -rp "VITE_PLAUSIBLE_DOMAIN (optional): " VITE_PLAUSIBLE_DOMAIN
read -rp "VITE_AVG_TURNAROUND [3–5 days]: " VITE_AVG_TURNAROUND
VITE_AVG_TURNAROUND=${VITE_AVG_TURNAROUND:-3–5 days}
read -rp "VITE_RECAPTCHA_SITE_KEY (optional): " VITE_RECAPTCHA_SITE_KEY
read -rp "RECAPTCHA_SECRET (optional): " RECAPTCHA_SECRET
read -rp "ADMIN_TOKEN_SECRET (required for admin tokens): " ADMIN_TOKEN_SECRET

setvar() { [ -n "$2" ] && netlify env:set "$1" "$2" >/dev/null; }

setvar SITE_URL "$SITE_URL"
setvar ADMIN_EMAILS "$ADMIN_EMAILS"
setvar SUPABASE_URL "$SUPABASE_URL"
setvar SUPABASE_SERVICE_ROLE "$SUPABASE_SERVICE_ROLE"
setvar SUPABASE_TABLE "$SUPABASE_TABLE"
setvar QUOTE_INBOX "$QUOTE_INBOX"
setvar EMAIL_PROVIDER "$EMAIL_PROVIDER"
setvar RESEND_API_KEY "$RESEND_API_KEY"
setvar SENDGRID_API_KEY "$SENDGRID_API_KEY"
setvar VITE_GA_ID "$VITE_GA_ID"
setvar VITE_PLAUSIBLE_DOMAIN "$VITE_PLAUSIBLE_DOMAIN"
setvar VITE_AVG_TURNAROUND "$VITE_AVG_TURNAROUND"
setvar VITE_RECAPTCHA_SITE_KEY "$VITE_RECAPTCHA_SITE_KEY"
setvar RECAPTCHA_SECRET "$RECAPTCHA_SECRET"
setvar ADMIN_TOKEN_SECRET "$ADMIN_TOKEN_SECRET"
setvar NODE_VERSION 18

netlify deploy --build --prod
echo "If Identity is not enabled, open the admin: netlify open:admin (Identity → Enable)."
