# VetWraps Studios - AI-Enhanced SaaS Platform

A comprehensive, AI-powered creative agency management platform built with modern technologies and veteran precision.

## 🚀 Features

### Three Role-Based Dashboards

#### 👑 Admin Panel
- **AI Email Writer**: Generate professional client communications
- **AI Quote Generator**: Create detailed project quotes with pricing breakdowns
- **Project Dashboard**: Complete project lifecycle management
- **User Management**: Role-based access control
- **Performance Analytics**: AI-powered insights and metrics

#### 👨‍💼 Employee Panel
- **AI Task Summarizer**: Intelligent work log analysis and insights
- **AI Design Assistant**: Creative suggestions and color palette recommendations
- **Task Board**: Kanban-style project management
- **Work Logging**: Time tracking with AI-powered summaries
- **Feedback Resolver**: Convert vague client feedback into actionable tasks

#### 👤 Client Panel
- **AI Revision Interface**: Translate feedback into design language
- **Project Tracker**: Visual progress monitoring
- **File Viewer**: Secure file delivery with commenting
- **Quote Viewer**: Interactive pricing with hoverable descriptions
- **Chatbot Concierge**: AI-powered project assistance

## 🛠 Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Supabase** - PostgreSQL database with real-time capabilities
- **OpenAI GPT-4** - AI-powered features and content generation
- **Clerk.dev** - Authentication and user management
- **Stripe** - Payment processing and invoicing

### Frontend
- **React 18** - Modern UI library with TypeScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing

### AI Integration
- **OpenAI API** - GPT-4 for content generation
- **Structured Outputs** - Pydantic models for reliable AI responses
- **Custom Prompts** - Role-specific AI assistance

## 📁 Project Structure

```
vetwraps-studio/
├── backend/                 # FastAPI backend
│   ├── routes/             # API endpoints
│   ├── agents/             # AI integration
│   ├── models/             # Pydantic models
│   ├── config/             # Configuration
│   └── utils/              # Utility functions
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities and API
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
└── docs/                   # Documentation
    └── database-schema.sql # Database schema
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account
- OpenAI API key
- Clerk.dev account

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run the backend**
   ```bash
   python main.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

### Database Setup

1. **Create a new Supabase project**
2. **Run the database schema**
   ```sql
   -- Copy and paste the contents of docs/database-schema.sql
   -- into your Supabase SQL editor
   ```

## 🔧 Environment Variables

### Backend (.env)
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

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
RESEND_API_KEY=your_resend_api_key
```

### Frontend (.env)
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API Configuration
VITE_API_BASE_URL=http://localhost:8000
```

## 🎯 Key Features

### AI-Powered Capabilities
- **Smart Email Generation**: Context-aware client communications
- **Intelligent Quote Creation**: Automated pricing with upsell suggestions
- **Task Analysis**: AI insights into work patterns and productivity
- **Feedback Translation**: Convert vague client input into actionable design briefs
- **Content Generation**: Automated proposals and testimonial requests

### Role-Based Access Control
- **Admin**: Full system access, user management, analytics
- **Employee**: Project-specific tools, work logging, AI assistance
- **Client**: Project viewing, feedback submission, file access

### Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Themes**: User preference support
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized with code splitting and lazy loading

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with:
- **Users**: Multi-role user management
- **Projects**: Complete project lifecycle tracking
- **Files**: Secure file storage with versioning
- **AI Requests**: Audit trail for AI interactions
- **Work Logs**: Time tracking and productivity metrics
- **Notifications**: Real-time user notifications

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth via Clerk
- **API Rate Limiting**: Prevent abuse and ensure fair usage
- **Input Validation**: Comprehensive data validation
- **File Security**: Watermarked previews and secure delivery

## 🚀 Deployment

### Backend (Railway/Fly.io)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Database (Supabase)
1. Create new project
2. Run database schema
3. Configure RLS policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@vetwraps.com or create an issue in the GitHub repository.

---

**VetWraps Studios** - Mission-ready design with veteran precision. 🎖️