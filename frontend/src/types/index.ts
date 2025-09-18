export interface User {
  id: string
  clerk_id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'employee' | 'client'
  status: 'active' | 'inactive' | 'suspended'
  avatar_url?: string
  phone?: string
  company?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  project_type: 'logo' | 'brand_identity' | 'social_media' | 'web_design' | 'print_design' | 'retainer'
  status: 'inquiry' | 'design' | 'review' | 'delivered' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  client_id: string
  assigned_employee_id?: string
  budget?: number
  deadline?: string
  tags: string[]
  created_at: string
  updated_at: string
  client?: User
  assigned_employee?: User
}

export interface AIRequest {
  id: string
  request_type: 'email_writer' | 'quote_generator' | 'task_summarizer' | 'feedback_resolver' | 'revision_translator' | 'testimonial_generator'
  user_id: string
  project_id?: string
  input_data: Record<string, any>
  output_data?: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  updated_at: string
}

export interface EmailWriterRequest {
  recipient_name: string
  recipient_email: string
  email_type: 'update' | 'quote' | 'follow_up' | 'proposal'
  project_context?: string
  tone: 'professional' | 'friendly' | 'urgent' | 'casual'
  additional_notes?: string
}

export interface QuoteGeneratorRequest {
  project_brief: string
  project_type: string
  complexity_level: 'low' | 'medium' | 'high'
  timeline: 'rush' | 'standard' | 'extended'
  client_budget_range?: string
}

export interface TaskSummarizerRequest {
  work_logs: Array<{
    task: string
    duration: number
    description: string
    date: string
  }>
  date_range: string
  include_insights: boolean
}

export interface FeedbackResolverRequest {
  client_feedback: string
  project_context: string
  current_design_stage: string
}

export interface RevisionTranslatorRequest {
  client_feedback: string
  design_type: string
  current_version: string
  project_requirements?: string
}

export interface WorkLog {
  id: string
  employee_id: string
  project_id: string
  task: string
  description: string
  duration: number
  date: string
  created_at: string
}

export interface ProjectFeedback {
  id: string
  project_id: string
  client_id: string
  feedback: string
  type: 'general' | 'revision' | 'approval' | 'concern'
  priority: 'low' | 'medium' | 'high'
  created_at: string
}

