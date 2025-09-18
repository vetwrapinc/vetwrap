export type UserRole = 'admin' | 'employee' | 'client';

export interface PublicMetadata {
  role?: UserRole;
  roles?: UserRole[];
  tier?: 'basic' | 'priority' | 'enterprise';
}

export interface DashboardUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface ProjectStatusSummary {
  inquiry: number;
  design: number;
  review: number;
  delivered: number;
}

export interface PerformanceMetric {
  label: string;
  value: string;
  delta?: string;
}

export interface TimelineEntry {
  id: string;
  projectName: string;
  status: string;
  owner: string;
  updatedAt: string;
}

export interface FileVersionItem {
  id: string;
  filename: string;
  version: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface AIResponse {
  title: string;
  content: string;
  highlights?: string[];
}

export interface RevisionTranslationRequest {
  projectName: string;
  feedback: string;
  stylePreferences?: string;
}
