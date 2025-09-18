import React, { Suspense, lazy } from 'react'
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
        <Analytics />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/subscribers" element={<Subscribers />} />
            <Route path="/case-studies" element={<CaseStudies />} />
            <Route path="/case-studies/:slug" element={<CaseStudy />} />
            <Route path="/whats-new" element={<WhatsNew />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

