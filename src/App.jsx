import React, { Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import WhyUs from './components/WhyUs'
import Portfolio from './components/Portfolio'
import Pricing from './components/Pricing'
import Contact from './components/Contact'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import StatusWidget from './components/StatusWidget'
import Trust from './components/Trust'

export default function App() {
  return (
    <div className="min-h-screen bg-night text-white relative overflow-x-clip orbital-bg">
      <Helmet>
        <link rel="canonical" href="https://vetwraps.com/" />
      </Helmet>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Floating schematic vectors */}
        <svg className="absolute top-20 left-6 opacity-30 animate-float" width="120" height="60" viewBox="0 0 120 60" fill="none">
          <rect x="1" y="1" width="118" height="58" rx="8" stroke="rgba(255,255,255,0.12)" strokeDasharray="6 6"/>
          <path d="M20 30 H100" stroke="rgba(95,183,250,0.5)" strokeWidth="1.25"/>
          <circle cx="60" cy="30" r="6" stroke="rgba(255,178,106,0.7)"/>
        </svg>
        <svg className="absolute bottom-16 right-10 opacity-25 animate-float" width="140" height="140" viewBox="0 0 140 140" fill="none">
          <circle cx="70" cy="70" r="60" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 6" />
          <circle cx="70" cy="70" r="30" stroke="rgba(95,183,250,0.35)" />
          <line x1="10" y1="70" x2="130" y2="70" stroke="rgba(255,178,106,0.5)" />
        </svg>
      </div>

      <Navbar />
      <main id="main" className="relative">
        <StatusWidget className="sticky top-16 z-30" />
        <Hero />
        <Services />
        <WhyUs />
        <Portfolio />
        <Pricing />
        <Testimonials />
        <Trust />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
