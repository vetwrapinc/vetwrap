import React, { useState } from 'react'
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
import ErrorBoundary from './components/ErrorBoundary'
import LoginPortal from './components/LoginPortal'

const AppShell = () => {
  const [showLoginPortal, setShowLoginPortal] = useState(false)

  const handleLoginSuccess = () => {
    setShowLoginPortal(false)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-night text-white relative overflow-x-clip orbital-bg">
        <Helmet>
          <link rel="canonical" href="https://vetwraps.com/" />
        </Helmet>

        <Navbar onLoginClick={() => setShowLoginPortal(true)} />
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

        {showLoginPortal && (
          <LoginPortal
            onClose={() => setShowLoginPortal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}
      </div>
    </ErrorBoundary>
  )
}

export default function App() {
  return <AppShell />
}
