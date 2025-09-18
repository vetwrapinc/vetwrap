VetWraps Studios Platform
=========================

A role-based SaaS platform for VetWraps Studios that unifies admin, employee, and client experiences. The stack pairs a FastAPI backend with a React + Tailwind + shadcn/ui frontend, Clerk.dev for authentication, Supabase for persistent data, and GPT-4 agents for AI workflows.

Tech Stack
---------
- **Frontend:** Vite + React + TypeScript, TailwindCSS, shadcn/ui patterns, React Router
- **Auth:** Clerk.dev multi-role sessions surfaced in the browser
- **Backend:** FastAPI with modular routers, OpenAI integrations, Supabase data access
- **AI:** GPT-4 via the official OpenAI client with typed Pydantic responses
- **Storage & Data:** Supabase (PostgreSQL + Storage) with extendable service layer
- **Payments & Email (planned):** Stripe for billing, Resend/SendGrid for transactional email
- **Hosting targets:** Vercel (frontend), Railway or Fly.io (backend)

Directory Structure
-------------------
```
backend/
  app/
    agents/           # GPT wrappers
    core/             # settings, auth utilities, dependencies
    routes/           # FastAPI routers for auth, AI, projects
    schemas/          # Pydantic models shared across routes
    services/         # Supabase service layer
  requirements.txt    # Backend dependencies
src/
  components/         # Common layout + shadcn-inspired UI primitives
  lib/                # API helpers, auth utilities, shared helpers
  pages/              # Role dashboards (admin, employee, client, portal)
  types/              # Shared TypeScript interfaces
```

Getting Started
---------------
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   - Frontend (`.env`):
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api`)
   - Backend (`backend/.env`):
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL` (defaults to `gpt-4o-mini`)
     - `CLERK_JWKS_URL`, `CLERK_AUDIENCE`, `CLERK_ISSUER`
     - `SUPABASE_URL`, `SUPABASE_KEY`
3. **Run the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```
4. **Run the frontend**
   ```bash
   npm run dev
   ```

Dashboards & Features
---------------------
### Admin (`/admin`)
- Pipeline analytics, timeline, file version history (Supabase powered)
- AI email writer (GPT-4) for client updates and proposals
- User management scaffolding for invitations, suspensions, and tier control

### Employee (`/employee`)
- AI assistant prompts for ideation and feedback clarification
- GPT-generated task summaries and standup notes
- Bug reporter and Kanban scaffolding ready for Supabase/PM integrations

### Client (`/client`)
- GPT-powered revision translator for clearer briefs
- Quote viewer, project tracker, secure file delivery placeholders
- Chatbot concierge entry point for GPT-led support

### Portal (`/portal`)
- Central landing experience for all Clerk-authenticated users with role aware navigation

APIs
----
- `POST /api/ai/admin/email-draft` – Drafts structured client emails (admin only)
- `POST /api/ai/employee/task-summary` – Generates daily standup summaries (admin + employee)
- `POST /api/ai/client/revision-brief` – Clarifies revision feedback (admin + client)
- `GET /api/projects/overview` – Supabase-backed analytics for admins/employees
- `GET /api/auth/me` – Clerk token validation with role metadata

Deployment Notes
----------------
- Provision Clerk applications for production and staging; configure allowed redirect URLs.
- Deploy the frontend to Vercel with the Vite adapter and required environment variables.
- Deploy the FastAPI service to Railway/Fly.io using the `backend/requirements.txt` and expose port `8000`.
- Ensure Supabase policies restrict access per role and integrate Stripe/Resend credentials before enabling billing or email automations.

Next Steps
----------
- Wire user management form actions to FastAPI routes that sync Clerk roles and Supabase access.
- Implement real project, timeline, and file version queries in Supabase.
- Connect Stripe for milestone billing and Resend/SendGrid for automated notifications.
- Extend AI routes for quote generation, testimonial drafts, and design ideation.
