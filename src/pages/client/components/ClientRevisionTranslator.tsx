import { FormEvent, useState } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import type { RevisionTranslationRequest } from '@/types';

interface RevisionTranslatorState extends RevisionTranslationRequest {}

export const ClientRevisionTranslator = () => {
  const [form, setForm] = useState<RevisionTranslatorState>({
    projectName: '',
    feedback: '',
    stylePreferences: ''
  });
  const [result, setResult] = useState<{
    translatedBrief: string;
    milestoneImpacts: string[];
    clarifyingQuestions: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof RevisionTranslatorState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.translateRevision(form);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to translate feedback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="col-span-2 xl:col-span-1">
      <CardHeader className="flex flex-col gap-1 border-b border-white/5">
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="h-5 w-5 text-indigo-300" />
          Revision assistant
        </CardTitle>
        <CardDescription className="text-slate-400">
          Translate high-level feedback into design-ready requirements and next steps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project</Label>
            <Input
              id="projectName"
              placeholder="Spring social media campaign"
              value={form.projectName}
              onChange={(event) => handleChange('projectName', event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback">Your feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Share what you&apos;d like to see changed or clarified."
              value={form.feedback}
              onChange={(event) => handleChange('feedback', event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stylePreferences">Style preferences (optional)</Label>
            <Textarea
              id="stylePreferences"
              placeholder="Add brand notes, inspiration links, or tone guidance."
              value={form.stylePreferences}
              onChange={(event) => handleChange('stylePreferences', event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit" className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Translating
                </>
              ) : (
                <>Clarify with GPT</>
              )}
            </Button>
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </div>
        </form>
        {result && (
          <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-300">Creative direction</p>
              <p className="mt-2 text-sm text-slate-200">{result.translatedBrief}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-300">Milestone impacts</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.milestoneImpacts.map((item) => (
                  <li key={item} className="rounded-lg border border-white/5 bg-black/40 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-300">Clarifying questions</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.clarifyingQuestions.map((item) => (
                  <li key={item} className="rounded-lg border border-white/5 bg-black/40 p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
