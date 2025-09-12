param(
  [string]$SiteUrl,
  [string]$AdminEmails,
  [string]$SupabaseUrl,
  [string]$SupabaseServiceRole,
  [string]$SupabaseTable = "quotes",
  [string]$QuoteInbox,
  [string]$EmailProvider,
  [string]$ResendApiKey,
  [string]$SendgridApiKey,
  [string]$ViteGaId,
  [string]$VitePlausibleDomain,
  [string]$ViteAvgTurnaround = "3–5 days",
  [string]$ViteRecaptchaSiteKey,
  [string]$RecaptchaSecret,
  [string]$AdminTokenSecret
)

Write-Host "Setting up Netlify environment for VetWraps..." -ForegroundColor Cyan

function Ensure-NetlifyCLI {
  $nl = (Get-Command "netlify" -ErrorAction SilentlyContinue)
  if (-not $nl) {
    Write-Host "Netlify CLI not found. Installing globally via npm..." -ForegroundColor Yellow
    npm i -g netlify-cli | Out-Null
  }
}

Ensure-NetlifyCLI

Write-Host "Logging in to Netlify (browser window may open)..." -ForegroundColor Cyan
netlify login | Out-Null

Write-Host "Linking this folder to a Netlify site (select existing or create new)..." -ForegroundColor Cyan
netlify link

function Set-Var($name, $value) {
  if ([string]::IsNullOrWhiteSpace($value)) { return }
  Write-Host "Setting $name" -ForegroundColor Green
  netlify env:set $name $value | Out-Null
}

if (-not $SiteUrl) { $SiteUrl = Read-Host "SITE_URL (e.g., https://vetwraps.com)" }
if (-not $AdminEmails) { $AdminEmails = Read-Host "ADMIN_EMAILS (comma-separated)" }
if (-not $SupabaseUrl) { $SupabaseUrl = Read-Host "SUPABASE_URL (leave blank to skip DB)" }
if (-not $SupabaseServiceRole) { $SupabaseServiceRole = Read-Host "SUPABASE_SERVICE_ROLE (leave blank to skip DB)" }
if (-not $QuoteInbox) { $QuoteInbox = Read-Host "QUOTE_INBOX (email for notifications; blank skips)" }
if (-not $EmailProvider) { $EmailProvider = Read-Host "EMAIL_PROVIDER (resend/sendgrid; blank skips)" }
if (-not $ResendApiKey) { $ResendApiKey = Read-Host "RESEND_API_KEY (if using Resend; blank skips)" }
if (-not $SendgridApiKey) { $SendgridApiKey = Read-Host "SENDGRID_API_KEY (if using SendGrid; blank skips)" }
if (-not $ViteGaId) { $ViteGaId = Read-Host "VITE_GA_ID (optional)" }
if (-not $VitePlausibleDomain) { $VitePlausibleDomain = Read-Host "VITE_PLAUSIBLE_DOMAIN (optional)" }
if (-not $ViteRecaptchaSiteKey) { $ViteRecaptchaSiteKey = Read-Host "VITE_RECAPTCHA_SITE_KEY (optional)" }
if (-not $RecaptchaSecret) { $RecaptchaSecret = Read-Host "RECAPTCHA_SECRET (optional)" }
if (-not $AdminTokenSecret) { $AdminTokenSecret = Read-Host "ADMIN_TOKEN_SECRET (required for admin tokens)" }

Set-Var SITE_URL $SiteUrl
Set-Var ADMIN_EMAILS $AdminEmails
Set-Var SUPABASE_URL $SupabaseUrl
Set-Var SUPABASE_SERVICE_ROLE $SupabaseServiceRole
Set-Var SUPABASE_TABLE $SupabaseTable
Set-Var QUOTE_INBOX $QuoteInbox
Set-Var EMAIL_PROVIDER $EmailProvider
Set-Var RESEND_API_KEY $ResendApiKey
Set-Var SENDGRID_API_KEY $SendgridApiKey
Set-Var VITE_GA_ID $ViteGaId
Set-Var VITE_PLAUSIBLE_DOMAIN $VitePlausibleDomain
Set-Var VITE_AVG_TURNAROUND $ViteAvgTurnaround
Set-Var VITE_RECAPTCHA_SITE_KEY $ViteRecaptchaSiteKey
Set-Var RECAPTCHA_SECRET $RecaptchaSecret
Set-Var ADMIN_TOKEN_SECRET $AdminTokenSecret
Set-Var NODE_VERSION 18

Write-Host "Environment variables set. Triggering a deploy..." -ForegroundColor Cyan
netlify deploy --build --prod

Write-Host "Done. If Identity is not yet enabled, open: netlify open:admin (Identity → Enable)." -ForegroundColor Yellow
