# 🚀 Vercel Environment Variables Setup

Copy and paste these environment variables into your Vercel project settings.

## 📋 Environment Variables to Add

Go to your Vercel project → Settings → Environment Variables and add each of these:

### 🗄️ Database (Supabase)
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 🤖 AI (OpenAI)
```
OPENAI_API_KEY=your_openai_api_key
```

### 🔐 Authentication (Clerk)
```
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 💳 Payments (Stripe) - Optional
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 📧 Email Services - Optional
```
SENDGRID_API_KEY=your_sendgrid_api_key
RESEND_API_KEY=your_resend_api_key
```

### ⚙️ App Configuration
```
DEBUG=False
ENVIRONMENT=production
```

## 🔍 How to Get Each Value

### Supabase Values
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to **API Keys**
3. Click **Create new secret key**
4. Copy the key → `OPENAI_API_KEY`

### Clerk Keys
1. Go to your Clerk dashboard
2. Navigate to **Configure** → **API Keys**
3. Copy:
   - **Publishable key** → `CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

### Stripe Keys (Optional)
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy:
   - **Publishable key** → `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

## ⚡ Quick Copy-Paste Template

Copy this entire block and replace the placeholder values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SENDGRID_API_KEY=SG...
RESEND_API_KEY=re_...
DEBUG=False
ENVIRONMENT=production
```

## 🚨 Important Notes

- **Replace all placeholder values** with your actual API keys
- **Never commit these values** to your repository
- **Test your deployment** after adding environment variables
- **Some services have rate limits** on free tiers

## ✅ Verification Checklist

After adding all environment variables:

- [ ] Supabase connection works
- [ ] Clerk authentication works
- [ ] OpenAI API calls work
- [ ] Database queries execute successfully
- [ ] User registration creates database records
- [ ] AI features generate responses

## 🔧 Troubleshooting

**If something doesn't work:**
1. Check that all environment variable names are exactly correct
2. Verify API keys are valid and have proper permissions
3. Check Vercel function logs for errors
4. Ensure database schema is properly set up

**Need help?** Check the Vercel function logs in your dashboard for specific error messages.
