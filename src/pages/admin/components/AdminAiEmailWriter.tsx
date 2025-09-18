import { FormEvent, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type AdminEmailRequest, type GeneratedEmail } from '@/lib/api';

const defaultState: AdminEmailRequest = {
  clientName: '',
  projectContext: '',
  tone: 'professional',
  callToAction: ''
};

export const AdminAiEmailWriter = () => {
  const [form, setForm] = useState<AdminEmailRequest>(defaultState);
  const [result, setResult] = useState<GeneratedEmail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof AdminEmailRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.generateAdminEmail(form);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="col-span-2 xl:col-span-1">
      <CardHeader className="flex flex-col gap-1 border-b border-white/5">
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-indigo-300" />
          AI email composer
        </CardTitle>
        <CardDescription className="text-slate-400">
          Generate polished client updates, follow-ups, and proposal notes tailored to each project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client name</Label>
              <Input
                id="clientName"
                placeholder="Acme Veterinary Clinic"
                value={form.clientName}
                onChange={(event) => handleChange('clientName', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                value={form.tone}
                onChange={(event) => handleChange('tone', event.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="direct">Direct</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectContext">Project context</Label>
            <Textarea
              id="projectContext"
              placeholder="Provide a short brief or update so the AI can reference key details."
              value={form.projectContext}
              onChange={(event) => handleChange('projectContext', event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callToAction">Call to action (optional)</Label>
            <Input
              id="callToAction"
              placeholder="Schedule a design review on Thursday"
              value={form.callToAction}
              onChange={(event) => handleChange('callToAction', event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit" className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating
                </>
              ) : (
                <>
                  Compose with GPT <Sparkles className="h-4 w-4" />
                </>
              )}
            </Button>
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </div>
        </form>
        {result && (
          <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-300">Suggested subject</p>
              <p className="text-lg font-semibold text-white">{result.subject}</p>
              <p className="mt-1 text-sm text-slate-400">{result.previewText}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm leading-6 text-slate-100">
              <pre className="whitespace-pre-wrap font-sans text-left text-sm text-slate-100">{result.body}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
