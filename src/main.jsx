import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'
import App from './App'
import './index.css'
import Subscribers from './routes/Subscribers'
import CaseStudies from './routes/CaseStudies'
import CaseStudy from './routes/CaseStudy'
import WhatsNew from './routes/WhatsNew'
import Portal from './routes/Portal'
import { Analytics } from './utils/analytics'
import PageTransition from './components/PageTransition'

function AnimatedRoutes() {
  const location = useLocation()

  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      window.requestAnimationFrame(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    }
  }, [location.pathname, location.hash])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><App /></PageTransition>} />
        <Route path="/subscribers" element={<PageTransition><Subscribers /></PageTransition>} />
        <Route path="/case-studies" element={<PageTransition><CaseStudies /></PageTransition>} />
        <Route path="/case-studies/:slug" element={<PageTransition><CaseStudy /></PageTransition>} />
        <Route path="/whats-new" element={<PageTransition><WhatsNew /></PageTransition>} />
        <Route path="/portal" element={<PageTransition><Portal /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Analytics />
        <AnimatedRoutes />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

