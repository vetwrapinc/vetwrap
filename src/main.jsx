import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'
import Subscribers from './routes/Subscribers'
import CaseStudies from './routes/CaseStudies'
import CaseStudy from './routes/CaseStudy'
import WhatsNew from './routes/WhatsNew'
import Portal from './routes/Portal'
import { Analytics } from './utils/analytics'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Analytics />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/case-studies/:slug" element={<CaseStudy />} />
          <Route path="/whats-new" element={<WhatsNew />} />
          <Route path="/portal" element={<Portal />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

