import React, { Suspense, lazy } from 'react'
import { DashboardProvider } from './context/DashboardContext'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'
import { Analytics } from './utils/analytics'

// Lazy load route components for code splitting
const Subscribers = lazy(() => import('./routes/Subscribers'))
const CaseStudies = lazy(() => import('./routes/CaseStudies'))
const CaseStudy = lazy(() => import('./routes/CaseStudy'))
const AdminPanel = lazy(() => import('./panels/AdminPanel'))
const EmployeePanel = lazy(() => import('./panels/EmployeePanel'))
const ClientPanel = lazy(() => import('./panels/ClientPanel'))
const ServiceDetail = lazy(() => import('./routes/ServiceDetail'))
const WhatsNew = lazy(() => import('./routes/WhatsNew'))

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen bg-night text-white flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
  </div>
)

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <DashboardProvider>
          <Analytics />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
            <Route path="/" element={<App />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/employee" element={<EmployeePanel />} />
            <Route path="/client" element={<ClientPanel />} />
            <Route path="/subscribers" element={<Subscribers />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudy />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/whats-new" element={<WhatsNew />} />
            </Routes>
          </Suspense>
        </DashboardProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

