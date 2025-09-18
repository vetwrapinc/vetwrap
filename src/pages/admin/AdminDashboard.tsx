import { useEffect, useState } from 'react';
import { BarChart3, Briefcase, FileStack, ShieldCheck, Sparkles, Users } from 'lucide-react';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils';
import { api, type ProjectOverviewResponse } from '@/lib/api';
import type { TimelineEntry } from '@/types';

import { AdminAiEmailWriter } from './components/AdminAiEmailWriter';

const navigation = [
  { label: 'Overview', href: '/admin', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Projects', href: '/admin', icon: <Briefcase className="h-4 w-4" />, badge: 'Pipeline' },
  { label: 'Files', href: '/admin', icon: <FileStack className="h-4 w-4" /> },
  { label: 'Team', href: '/admin', icon: <Users className="h-4 w-4" /> },
  { label: 'Security', href: '/admin', icon: <ShieldCheck className="h-4 w-4" /> }
];

export const AdminDashboard = () => {
  const [overview, setOverview] = useState<ProjectOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await api.getProjectOverview();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const renderTimeline = (entries: TimelineEntry[]) => {
    if (!entries.length) {
      return (
        <EmptyState
          title="No active milestones"
          description="Once projects start moving through inquiry, design, and review states, you&apos;ll see a real-time feed here."
        />
      );
    }

    return (
      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry.id} className="rounded-lg border border-white/5 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span className="font-semibold text-white">{entry.projectName}</span>
              <span>{formatDate(entry.updatedAt)}</span>
            </div>
            <p className="mt-2 text-sm text-indigo-200">{entry.status}</p>
            <p className="text-xs text-slate-400">Owner: {entry.owner}</p>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <DashboardLayout
      title="Admin control center"
      description="Coordinate VetWraps Studios operations, teams, billing, and AI automations from one workspace."
      navigation={navigation}
      actions={<Button variant="secondary">New project</Button>}
    >
      <section className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Pipeline status</CardTitle>
            <CardDescription className="text-slate-400">Live count of projects per stage</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-400">Crunching metrics…</p>
            ) : error ? (
              <p className="text-sm text-rose-400">{error}</p>
            ) : overview ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(overview.statusSummary).map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/5 bg-slate-900/40 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No projects yet" description="Create your first client engagement to populate this dashboard." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Performance analytics</CardTitle>
            <CardDescription className="text-slate-400">Weekly velocity, utilization, and billing signals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview?.weeklyMetrics?.length ? (
              <div className="space-y-3">
                {overview.weeklyMetrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/40 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{metric.label}</p>
                      <p className="mt-1 text-xl font-semibold text-white">{metric.value}</p>
                    </div>
                    {metric.delta && <span className="stat-pill">{metric.delta}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No metrics yet" description="Connect Supabase analytics to surface revenue, cycle times, and workload KPIs." />
            )}
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 text-sm text-indigo-100">
              <p className="font-medium">AI summary</p>
              <p className="mt-2 text-indigo-100/80">
                {overview?.aiInsights?.[0] ?? 'Once project activity is available, GPT-4 will summarize weekly wins, risks, and next-best actions.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <AdminAiEmailWriter />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Active timeline</CardTitle>
            <CardDescription className="text-slate-400">Key milestones and status changes in real time</CardDescription>
          </CardHeader>
          <CardContent>{overview ? renderTimeline(overview.activeTimeline) : null}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">File versioning</CardTitle>
            <CardDescription className="text-slate-400">Upload new renders, review diffs, or roll back instantly</CardDescription>
          </CardHeader>
          <CardContent>
            {overview?.recentFiles?.length ? (
              <div className="space-y-3">
                {overview.recentFiles.map((file) => (
                  <div key={file.id} className="rounded-lg border border-white/5 bg-slate-900/40 p-4">
                    <p className="text-sm font-semibold text-white">{file.filename}</p>
                    <p className="text-xs text-slate-400">Version {file.version}</p>
                    <p className="text-xs text-slate-500">Uploaded {formatDate(file.uploadedAt)} by {file.uploadedBy}</p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" size="sm">Preview</Button>
                      <Button variant="ghost" size="sm">Rollback</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No versions uploaded"
                description="Connect Supabase Storage to track source files, exports, and watermarked previews."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">User management</CardTitle>
            <CardDescription className="text-slate-400">Invite teammates, set permissions, and assign ownership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="employeeEmail">Employee email</Label>
                  <Input id="employeeEmail" type="email" placeholder="designer@vetwraps.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeRole">Role</Label>
                  <select
                    id="employeeRole"
                    className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Service tier</Label>
                <select
                  id="tier"
                  className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <option value="studio">Studio</option>
                  <option value="priority">Priority</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="button">Send invite</Button>
                <Button type="button" variant="secondary">
                  Suspend access
                </Button>
                <Button type="button" variant="destructive">
                  Remove
                </Button>
              </div>
            </form>
            <p className="text-xs text-slate-500">
              Connect this form to the FastAPI `/auth/users` endpoints to sync Clerk roles, Supabase permissions, and project ownership.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Proposal & testimonial automations</CardTitle>
            <CardDescription className="text-slate-400">
              Use GPT to draft estimates, scope documents, and client-ready testimonial prompts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="secondary" className="w-full justify-between">
              Launch quote generator
              <FileStack className="h-4 w-4" />
            </Button>
            <Button variant="secondary" className="w-full justify-between">
              Draft testimonial requests
              <Sparkles className="h-4 w-4" />
            </Button>
            <p className="text-xs text-slate-500">
              Wire these actions to the `/ai/admin/quote` and `/ai/admin/testimonial` endpoints to automate outbound communication.
            </p>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
