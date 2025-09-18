import { Kanban, Lightbulb, MessageSquare, TimerReset, Wand2 } from 'lucide-react';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { EmployeeTaskSummarizer } from './components/EmployeeTaskSummarizer';

const navigation = [
  { label: 'Workspace', href: '/employee', icon: <Kanban className="h-4 w-4" /> },
  { label: 'Ideas', href: '/employee', icon: <Lightbulb className="h-4 w-4" /> },
  { label: 'Feedback', href: '/employee', icon: <MessageSquare className="h-4 w-4" /> },
  { label: 'Timers', href: '/employee', icon: <TimerReset className="h-4 w-4" /> }
];

export const EmployeeDashboard = () => {
  return (
    <DashboardLayout
      title="Creative studio"
      description="Plan production tasks, explore AI inspiration, and capture project context."
      navigation={navigation}
      actions={<Button variant="secondary">Log hours</Button>}
    >
      <section className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">AI assistant</CardTitle>
            <CardDescription className="text-slate-400">Get project-specific inspiration and visual direction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Describe the project brief, tone, and goals to generate design prompts." />
            <div className="flex gap-3">
              <Button className="gap-2">
                Brainstorm with GPT
                <Wand2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost">Save inspiration</Button>
            </div>
            <p className="text-xs text-slate-500">Connect this widget to the `/ai/employee/ideas` endpoint to capture suggestions.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Task board</CardTitle>
            <CardDescription className="text-slate-400">Kanban view of today&apos;s deliverables</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No tasks assigned"
              description="Once projects are assigned through the admin console, your Kanban board will populate automatically."
            />
          </CardContent>
        </Card>

        <EmployeeTaskSummarizer />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">AI feedback resolver</CardTitle>
            <CardDescription className="text-slate-400">
              Turn ambiguous client comments into prioritized action items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Paste the feedback from email, chat, or Loom and let GPT clarify actionable steps." />
            <Button className="w-full">Clarify feedback</Button>
            <p className="text-xs text-slate-500">Integrate with `/ai/employee/feedback` to receive structured TODOs and estimates.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Bug reporter</CardTitle>
            <CardDescription className="text-slate-400">
              Flag issues, attach screenshots, and create tickets without leaving the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bugTitle">Title</Label>
              <Input id="bugTitle" placeholder="Exported video audio is out of sync" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bugDetails">Details</Label>
              <Textarea id="bugDetails" placeholder="Describe the issue, reproduction steps, and any assets to review." />
            </div>
            <Button className="w-full" variant="secondary">
              Submit ticket
            </Button>
            <p className="text-xs text-slate-500">Route submissions to Supabase and auto-create tasks in your PM tool via webhooks.</p>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
