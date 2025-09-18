import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const { getToken } = useAuth()
  const token = await getToken()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const apiEndpoints = {
  // Auth
  auth: {
    me: '/api/auth/me',
    updateProfile: '/api/auth/me',
  },
  
  // Admin
  admin: {
    users: '/api/admin/users',
    updateUserRole: (userId: string) => `/api/admin/users/${userId}/role`,
    projects: '/api/admin/projects',
    analytics: '/api/admin/analytics',
  },
  
  // Employee
  employee: {
    myProjects: '/api/employee/my-projects',
    updateProjectStatus: (projectId: string) => `/api/employee/projects/${projectId}/status`,
    workLog: '/api/employee/work-log',
  },
  
  // Client
  client: {
    myProjects: '/api/client/my-projects',
    getProject: (projectId: string) => `/api/client/projects/${projectId}`,
    getProjectFiles: (projectId: string) => `/api/client/files/${projectId}`,
    submitFeedback: '/api/client/feedback',
  },
  
  // Projects
  projects: {
    list: '/api/projects',
    get: (projectId: string) => `/api/projects/${projectId}`,
  },
  
  // AI
  ai: {
    emailWriter: '/api/ai/email-writer',
    quoteGenerator: '/api/ai/quote-generator',
    taskSummarizer: '/api/ai/task-summarizer',
    feedbackResolver: '/api/ai/feedback-resolver',
    revisionTranslator: '/api/ai/revision-translator',
  },
}

export default api
