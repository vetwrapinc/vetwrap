import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
  useUser
} from '@clerk/clerk-react';
import { ArrowRight, LayoutDashboard, Sparkles, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { roleLabels, roleToPortalPath, resolveRoles, getPrimaryRole } from '@/lib/auth';
import type { PublicMetadata, UserRole } from '@/types';

export const PortalLanding = () => {
  const navigate = useNavigate();
  const { isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const metadata = useMemo(() => (user?.publicMetadata ?? null) as PublicMetadata | null, [user]);
  const roles = useMemo(() => resolveRoles(metadata), [metadata]);
  const primaryRole = useMemo(() => getPrimaryRole(roles), [roles]);

  const handleEnter = (role: UserRole) => {
    navigate(roleToPortalPath[role]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-white/5 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-200">
            <Sparkles className="h-5 w-5" />
          </span>
          VetWraps Studios Portal
        </Link>
        <SignedIn>
          <UserButton afterSignOutUrl="/portal" />
        </SignedIn>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl space-y-10">
          <div className="text-center">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-1 text-xs font-medium uppercase tracking-wide text-indigo-200">
              Unified access hub
            </p>
            <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
              Choose your workspace to launch the VetWraps experience
            </h1>
            <p className="mt-4 text-base text-slate-400">
              Secure, role-based dashboards for administrators, team members, and clients—powered by GPT copilots and real-time project data.
            </p>
          </div>

          <SignedOut>
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-xl shadow-black/40">
              <p className="text-sm text-slate-300">
                You&apos;ll need an invitation from VetWraps Studios to access the portal. Sign in with your authorized Clerk account to continue.
              </p>
              <div className="mt-6 flex justify-center">
                <SignInButton mode="modal">
                  <Button size="lg" className="gap-2">
                    Launch secure sign-in
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </SignInButton>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <section className="grid gap-6 sm:grid-cols-2">
              {roles.map((role) => (
                <article
                  key={role}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 shadow-xl shadow-black/40"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="stat-pill">{roleLabels[role]}</div>
                      <h2 className="text-2xl font-semibold text-white">{role === 'admin' ? 'Operations Command' : role === 'employee' ? 'Creative Studio' : 'Client Lounge'}</h2>
                      <p className="text-sm text-slate-400">
                        {role === 'admin'
                          ? 'Automate proposals, orchestrate teams, and review every project milestone at a glance.'
                          : role === 'employee'
                            ? 'Focus on deliverables with AI task summaries, Kanban timelines, and feedback translators.'
                            : 'Track progress, approve files, and request revisions with GPT-clarified updates.'}
                      </p>
                    </div>
                    <span className="rounded-full bg-indigo-500/20 p-3 text-indigo-200">
                      {role === 'admin' ? <LayoutDashboard className="h-5 w-5" /> : role === 'employee' ? <Users className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </span>
                  </div>
                  <Button onClick={() => handleEnter(role)} className="mt-6 w-full justify-between">
                    Enter {roleLabels[role]} portal
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </article>
              ))}

              {!roles.length && authLoaded && userLoaded && (
                <article className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-left text-amber-100">
                  <h2 className="text-lg font-semibold">Access pending</h2>
                  <p className="mt-2 text-sm text-amber-100/80">
                    Your Clerk account is active, but an administrator must assign a role before you can access a workspace. Please reach out to VetWraps support.
                  </p>
                </article>
              )}
            </section>
          </SignedIn>

          {primaryRole && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
              <p>
                Primary workspace:
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 px-2 text-indigo-200 hover:text-indigo-100"
                  onClick={() => handleEnter(primaryRole)}
                >
                  Jump back in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
