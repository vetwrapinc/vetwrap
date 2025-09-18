# VetWraps Studios - Vercel Deployment Guide

Complete guide to deploy the VetWraps Studios SaaS platform on Vercel with both frontend and backend.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/vetwraps-studio)

## 📋 Prerequisites

Before deploying, you'll need accounts for:

1. **Vercel** - [vercel.com](https://vercel.com)
2. **Supabase** - [supabase.com](https://supabase.com)
3. **Clerk.dev** - [clerk.dev](https://clerk.dev)
4. **OpenAI** - [openai.com](https://openai.com)
5. **Stripe** (optional) - [stripe.com](https://stripe.com)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `vetwraps-studio`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users

### 2. Run Database Schema
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy the contents of `docs/database-schema.sql`
4. Paste and run the SQL script
5. Verify tables are created in "Table Editor"

### 3. Get Supabase Credentials
1. Go to "Settings" → "API"
2. Copy the following values:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

## 🔐 Authentication Setup (Clerk.dev)

### 1. Create Clerk Application
1. Go to [clerk.dev](https://clerk.dev)
2. Click "Create Application"
3. Choose "Next.js" as framework
4. Enter application name: `VetWraps Studios`

### 2. Configure Authentication
1. In Clerk dashboard, go to "Configure" → "Email, Phone, Username"
2. Enable "Email address" and "Username"
3. Go to "User & Authentication" → "User metadata"
4. Add custom fields:
   - `role` (String) - for admin/employee/client roles
   - `company` (String) - for company information

### 3. Get Clerk Credentials
1. Go to "API Keys"
2. Copy the following values:
   - `Publishable key` (CLERK_PUBLISHABLE_KEY)
   - `Secret key` (CLERK_SECRET_KEY)

## 🤖 AI Setup (OpenAI)

### 1. Create OpenAI Account
1. Go to [openai.com](https://openai.com)
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new API key
5. Copy the key (OPENAI_API_KEY)

## 💳 Payment Setup (Stripe) - Optional

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Complete account setup
3. Go to "Developers" → "API Keys"
4. Copy the following values:
   - `Publishable key` (STRIPE_PUBLISHABLE_KEY)
   - `Secret key` (STRIPE_SECRET_KEY)

## 🚀 Deploy to Vercel

### Method 1: Deploy from GitHub (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Choose "VetWraps Studios" as project name

3. **Configure Build Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**:
   In Vercel dashboard, go to "Settings" → "Environment Variables" and add:

   ```env
   # Database
   SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI
    OPENAI_API_KEY=your_openai_api_key

   # Clerk Auth
    CLERK_SECRET_KEY=your_clerk_secret_key
    CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

   # Stripe (Optional)
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

   # Email (Optional)
   SENDGRID_API_KEY=your_sendgrid_api_key
   RESEND_API_KEY=your_resend_api_key

   # App Settings
   DEBUG=False
   ENVIRONMENT=production
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-project.vercel.app`

### Method 2: Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add OPENAI_API_KEY
   vercel env add CLERK_SECRET_KEY
   vercel env add CLERK_PUBLISHABLE_KEY
   # ... add all other variables
   ```

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

## 🔧 Post-Deployment Configuration

### 1. Configure Clerk Webhooks
1. In Clerk dashboard, go to "Webhooks"
2. Add endpoint: `https://your-domain.vercel.app/api/auth/webhook`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret

### 2. Update CORS Settings
1. In Supabase dashboard, go to "Settings" → "API"
2. Add your Vercel domain to "Additional URLs"
3. Update "Site URL" to your Vercel domain

### 3. Test the Application
1. Visit your deployed URL
2. Try signing up with Clerk
3. Test the AI features
4. Verify database connections

## 📊 Monitoring and Analytics

### Vercel Analytics
- Built-in analytics in Vercel dashboard
- Performance monitoring
- Error tracking

### Supabase Monitoring
- Database performance metrics
- Real-time connection monitoring
- Query performance insights

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use Vercel's environment variable management
- Rotate API keys regularly

### Database Security
- Row Level Security (RLS) is enabled
- API keys are properly scoped
- User authentication is required for all endpoints

### CORS Configuration
- Properly configured for your domain
- No wildcard origins in production

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Node.js version (18+)
   - Verify all dependencies are installed
   - Check build logs in Vercel dashboard

2. **API Errors**:
   - Verify environment variables are set
   - Check Supabase connection
   - Verify Clerk authentication

3. **Database Issues**:
   - Ensure RLS policies are correct
   - Check user permissions
   - Verify table structure

### Debug Mode
Set `DEBUG=True` in environment variables to enable detailed error logging.

## 📈 Scaling Considerations

### Vercel Limits
- Serverless functions: 10s execution time (free), 60s (pro)
- Bandwidth: 100GB/month (free), 1TB (pro)
- Build minutes: 6000/month (free), unlimited (pro)

### Database Scaling
- Supabase free tier: 500MB database, 2GB bandwidth
- Upgrade to Pro for more resources

### AI Usage
- Monitor OpenAI API usage
- Implement rate limiting
- Consider caching for repeated requests

## 🎯 Next Steps

1. **Custom Domain**: Add your custom domain in Vercel
2. **SSL Certificate**: Automatically provided by Vercel
3. **CDN**: Global CDN included with Vercel
4. **Monitoring**: Set up alerts and monitoring
5. **Backup**: Regular database backups via Supabase

## 📞 Support

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Clerk Support**: [clerk.dev/support](https://clerk.dev/support)

---

**VetWraps Studios** - Mission-ready design with veteran precision. 🎖️

Your AI-enhanced creative agency platform is now live on Vercel! 🚀
