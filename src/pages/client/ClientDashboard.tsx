import { CreditCard, FileText, MessagesSquare, Sparkles, Workflow } from 'lucide-react';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientRevisionTranslator } from './components/ClientRevisionTranslator';

const navigation = [
  { label: 'Home', href: '/client', icon: <Workflow className="h-4 w-4" /> },
  { label: 'Quotes', href: '/client', icon: <CreditCard className="h-4 w-4" /> },
  { label: 'Files', href: '/client', icon: <FileText className="h-4 w-4" /> },
  { label: 'Support', href: '/client', icon: <MessagesSquare className="h-4 w-4" /> }
];

export const ClientDashboard = () => {
  return (
    <DashboardLayout
      title="Client lounge"
      description="Review project progress, collaborate on revisions, and access secure deliveries."
      navigation={navigation}
      actions={<Button variant="secondary">Request update</Button>}
    >
      <section className="dashboard-grid">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Visual project tracker</CardTitle>
            <CardDescription className="text-slate-400">
              Step-by-step transparency into inquiry, design, review, and delivery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No active projects"
              description="Once VetWraps kicks off your project, milestones and GPT-generated status summaries will appear here."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">AI quote viewer</CardTitle>
            <CardDescription className="text-slate-400">Preview pricing scenarios and upsell opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-lg border border-white/5 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-white">Design sprint retainer</p>
              <p className="text-xs text-slate-400">$2,950 / milestone</p>
              <p className="text-xs text-slate-500">Hover on line items (desktop) to reveal AI-suggested enhancements.</p>
            </div>
            <Button className="w-full gap-2" variant="secondary">
              Explore add-ons
              <Sparkles className="h-4 w-4" />
            </Button>
            <p className="text-xs text-slate-500">Connect to Stripe for checkout and Resend for automated invoicing emails.</p>
          </CardContent>
        </Card>

        <ClientRevisionTranslator />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">File previewer</CardTitle>
            <CardDescription className="text-slate-400">
              Comment on video frames, image overlays, or motion drafts directly in the browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="No files shared yet"
              description="Supabase Storage will list your watermarked previews, final deliveries, and collaboration threads here."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Chatbot concierge</CardTitle>
            <CardDescription className="text-slate-400">
              Ask for ETAs, scope clarifications, or revision support 24/7.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <EmptyState
              title="Conversation history empty"
              description="Once messaging is connected, GPT-4 will summarize chat threads and highlight next actions."
            />
            <Button className="w-full">Start a conversation</Button>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default ClientDashboard;
