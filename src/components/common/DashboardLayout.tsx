import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignedIn } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
}

interface DashboardLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  navigation: DashboardNavItem[];
  children: ReactNode;
}

export const DashboardLayout = ({ title, description, actions, navigation, children }: DashboardLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-950">
      <aside className="hidden w-72 flex-col border-r border-white/5 bg-slate-950/80 p-6 backdrop-blur lg:flex">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="h-3 w-3 rounded-full bg-indigo-500" />
          VetWraps Studios
        </Link>
        <nav className="mt-10 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive ? 'bg-indigo-500/20 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge && (
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-200">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="rounded-lg border border-white/5 bg-white/5 p-4 text-xs text-slate-300">
            <p className="font-semibold text-white">AI Productivity Center</p>
            <p className="mt-1 text-slate-400">
              Launch GPT copilots, automate quotes, and keep projects flowing from one command center.
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
              <Link to="/admin">Explore capabilities</Link>
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/5 bg-slate-950/80 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-xl font-semibold text-white">{title}</h1>
            {description && <p className="text-sm text-slate-400">{description}</p>}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link to="/portal">Switch portal</Link>
            </Button>
            <SignedIn>
              <UserButton afterSignOutUrl="/portal" appearance={{ elements: { userButtonAvatarBox: 'h-9 w-9 border border-white/10' } }} />
            </SignedIn>
          </div>
        </header>
        <main className="flex-1 space-y-6 bg-slate-950/60 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
