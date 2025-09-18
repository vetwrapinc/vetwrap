import { FormEvent, useState } from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type TaskSummarizerRequest, type TaskSummary } from '@/lib/api';

const defaultState: TaskSummarizerRequest = {
  tasksCompleted: '',
  obstacles: '',
  nextFocus: ''
};

export const EmployeeTaskSummarizer = () => {
  const [form, setForm] = useState<TaskSummarizerRequest>(defaultState);
  const [result, setResult] = useState<TaskSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof TaskSummarizerRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.summarizeTasks(form);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="col-span-2 xl:col-span-1">
      <CardHeader className="flex flex-col gap-1 border-b border-white/5">
        <CardTitle className="flex items-center gap-2 text-white">
          <ClipboardList className="h-5 w-5 text-indigo-300" />
          AI task summarizer
        </CardTitle>
        <CardDescription className="text-slate-400">
          Convert your daily notes into a structured log and standup summary in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="tasksCompleted">What did you complete?</Label>
            <Textarea
              id="tasksCompleted"
              placeholder="Detail the design iterations, meetings, or feedback you handled today."
              value={form.tasksCompleted}
              onChange={(event) => handleChange('tasksCompleted', event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="obstacles">Roadblocks</Label>
            <Textarea
              id="obstacles"
              placeholder="Mention anything slowing you down or requiring support."
              value={form.obstacles}
              onChange={(event) => handleChange('obstacles', event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextFocus">Tomorrow&apos;s focus</Label>
            <Textarea
              id="nextFocus"
              placeholder="What are the next deliverables or milestones you plan to tackle?"
              value={form.nextFocus}
              onChange={(event) => handleChange('nextFocus', event.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button type="submit" className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Summarizing
                </>
              ) : (
                <>Create standup notes</>
              )}
            </Button>
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </div>
        </form>
        {result && (
          <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-300">Daily synopsis</p>
              <p className="mt-2 text-sm text-slate-200">{result.summary}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-300">Log entries</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.logLineItems.map((item) => (
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
