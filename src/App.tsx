import { useMemo, type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RedirectToSignIn, useUser } from '@clerk/clerk-react';

import { PortalLanding } from '@/pages/portal/PortalLanding';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard';
import { ClientDashboard } from '@/pages/client/ClientDashboard';
import { hasRequiredRole, resolveRoles } from '@/lib/auth';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowed: UserRole[];
  children: ReactElement;
}

const ProtectedRoute = ({ allowed, children }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn, user } = useUser();

  const roles = useMemo(() => resolveRoles((user?.publicMetadata ?? {}) as never), [user]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Checking access…
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (!hasRequiredRole(roles, allowed)) {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal" replace />} />
      <Route path="/portal" element={<PortalLanding />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowed={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowed={['admin', 'employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client"
        element={
          <ProtectedRoute allowed={['admin', 'client']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-300">
            <h1 className="text-3xl font-semibold text-white">Page not found</h1>
            <p className="mt-2 text-sm text-slate-400">The route you&apos;re looking for does not exist. Return to the portal to continue.</p>
            <a href="/portal" className="mt-6 text-indigo-300 hover:text-indigo-200">
              Go back to the portal
            </a>
          </div>
        }
      />
    </Routes>
  );
};

export default App;
