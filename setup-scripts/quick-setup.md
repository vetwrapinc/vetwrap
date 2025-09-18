# 🚀 VetWraps Studios - Quick Setup Guide

Since you already have accounts, here's the fastest way to get your platform running:

## ⚡ 5-Minute Setup

### 1. Database Setup (Supabase) - 2 minutes
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Copy the entire contents of `setup-scripts/setup-database.sql`
4. Paste and run the SQL script
5. ✅ Database is ready!

### 2. Authentication Setup (Clerk) - 2 minutes
1. Open your Clerk dashboard
2. Open browser console (F12)
3. Copy and paste the contents of `setup-scripts/setup-clerk.js`
4. Follow the console instructions
5. ✅ Authentication is ready!

### 3. Vercel Deployment - 1 minute
1. Go to your Vercel dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Open browser console (F12)
5. Copy and paste the contents of `setup-scripts/setup-vercel.js`
6. Follow the console instructions
7. ✅ Platform is live!

## 🔑 Environment Variables Quick Copy

Copy these into Vercel Environment Variables:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
SENDGRID_API_KEY=your_sendgrid_api_key
RESEND_API_KEY=your_resend_api_key
DEBUG=False
ENVIRONMENT=production
```

## 🎯 What You Get

- ✅ **Admin Dashboard**: AI email writer, quote generator, project management
- ✅ **Employee Dashboard**: AI task summarizer, work logging, feedback resolver
- ✅ **Client Dashboard**: AI revision interface, project tracker, file viewer
- ✅ **Full Authentication**: Role-based access control
- ✅ **AI Integration**: OpenAI GPT-4 for all AI features
- ✅ **Database**: Secure PostgreSQL with RLS
- ✅ **File Storage**: Supabase storage for project files

## 🚨 Troubleshooting

**If something doesn't work:**
1. Check the browser console for errors
2. Verify all environment variables are set
3. Make sure database schema was run successfully
4. Check Vercel build logs for any issues

**Need help?** The setup scripts will guide you through each step with exact instructions!

---

**Ready to deploy?** Run the setup scripts and you'll be live in 5 minutes! 🎉
