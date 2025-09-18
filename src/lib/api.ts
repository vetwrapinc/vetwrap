import type { RevisionTranslationRequest } from '@/types';
import type { ProjectStatusSummary, PerformanceMetric, TimelineEntry, FileVersionItem } from '@/types';

type FetchOptions = RequestInit & { path: string };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

const withBase = (path: string): string => {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${normalized}`;
};

async function request<T>({ path, ...options }: FetchOptions): Promise<T> {
  const response = await fetch(withBase(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  return (await response.json()) as T;
}

export interface AdminEmailRequest {
  clientName: string;
  projectContext: string;
  tone: 'friendly' | 'professional' | 'direct';
  callToAction?: string;
}

export interface GeneratedEmail {
  subject: string;
  previewText: string;
  body: string;
}

export interface TaskSummarizerRequest {
  tasksCompleted: string;
  obstacles?: string;
  nextFocus?: string;
}

export interface TaskSummary {
  summary: string;
  logLineItems: string[];
}

export interface RevisionTranslatorResponse {
  translatedBrief: string;
  milestoneImpacts: string[];
  clarifyingQuestions: string[];
}

export interface ProjectOverviewResponse {
  statusSummary: ProjectStatusSummary;
  weeklyMetrics: PerformanceMetric[];
  activeTimeline: TimelineEntry[];
  recentFiles: FileVersionItem[];
  aiInsights: string[];
}

export const api = {
  generateAdminEmail: (payload: AdminEmailRequest) =>
    request<GeneratedEmail>({
      path: 'ai/admin/email-draft',
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  summarizeTasks: (payload: TaskSummarizerRequest) =>
    request<TaskSummary>({
      path: 'ai/employee/task-summary',
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  translateRevision: (payload: RevisionTranslationRequest) =>
    request<RevisionTranslatorResponse>({
      path: 'ai/client/revision-brief',
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  getProjectOverview: () =>
    request<ProjectOverviewResponse>({
      path: 'projects/overview',
      method: 'GET'
    })
};
