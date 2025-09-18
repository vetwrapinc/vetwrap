import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AnimatePresence, motion } from 'framer-motion'
import { ClerkProvider, useUser } from '@clerk/clerk-react'
import App from './App'
import './index.css'
import { DashboardProvider } from './context/DashboardContext'
import { Analytics } from './utils/analytics'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const Subscribers = lazy(() => import('./routes/Subscribers'))
const CaseStudies = lazy(() => import('./routes/CaseStudies'))
const CaseStudy = lazy(() => import('./routes/CaseStudy'))
const AdminPanel = lazy(() => import('./panels/AdminPanel'))
const EmployeePanel = lazy(() => import('./panels/EmployeePanel'))
const ClientPanel = lazy(() => import('./panels/ClientPanel'))
const ServiceDetail = lazy(() => import('./routes/ServiceDetail'))
const WhatsNew = lazy(() => import('./routes/WhatsNew'))

const LoadingSpinner = () => (
  <div className="min-h-screen bg-night text-white flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function PageTransition({ children }) {
  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0, filter: 'blur(18px)', y: 24 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(12px)', y: -16 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      style={{ minHeight: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function DashboardRedirect() {
  if (!clerkPubKey) {
    console.warn('Clerk publishable key missing; redirecting to home.')
    return <Navigate to="/" replace />
  }

  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return <PageTransition><LoadingSpinner /></PageTransition>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  const role = user.publicMetadata?.role || user.unsafeMetadata?.role || 'client'
  return <Navigate to={`/dashboard/${role}`} replace />
}

function AppRouter() {
  const location = useLocation()

  return (
    <DashboardProvider>
      <Analytics />
      <Suspense fallback={<LoadingSpinner />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><App /></PageTransition>} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
            <Route path="/dashboard/employee" element={<PageTransition><EmployeePanel /></PageTransition>} />
            <Route path="/dashboard/client" element={<PageTransition><ClientPanel /></PageTransition>} />
            <Route path="/subscribers" element={<PageTransition><Subscribers /></PageTransition>} />
            <Route path="/case-studies" element={<PageTransition><CaseStudies /></PageTransition>} />
            <Route path="/case-studies/:slug" element={<PageTransition><CaseStudy /></PageTransition>} />
            <Route path="/services/:slug" element={<PageTransition><ServiceDetail /></PageTransition>} />
            <Route path="/whats-new" element={<PageTransition><WhatsNew /></PageTransition>} />
            <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/employee" element={<Navigate to="/dashboard/employee" replace />} />
            <Route path="/client" element={<Navigate to="/dashboard/client" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </DashboardProvider>
  )
}

function Providers() {
  if (!clerkPubKey) {
    return <AppRouter />
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <AppRouter />
    </ClerkProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Providers />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
