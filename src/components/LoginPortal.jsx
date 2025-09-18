import React, { useState, useEffect } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'

const LoginPortal = ({ onClose, onLoginSuccess }) => {
  const { user, isLoaded } = useUser()
  const { signIn, signUp, openSignIn, openSignUp } = useClerk()
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user && isLoaded) {
      onLoginSuccess(user)
    }
  }, [user, isLoaded, onLoginSuccess])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await openSignIn()
    } catch (err) {
      setError('Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await openSignUp()
    } catch (err) {
      setError('Failed to sign up. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBasedMessage = (role) => {
    switch (role) {
      case 'admin':
        return {
          title: 'Welcome, Administrator',
          message: 'You have full access to manage the VetWraps platform.',
          features: ['User Management', 'Project Oversight', 'Analytics Dashboard', 'AI Tools']
        }
      case 'employee':
        return {
          title: 'Welcome, Team Member',
          message: 'Access your work dashboard and project tools.',
          features: ['Task Management', 'Project Files', 'Time Tracking', 'AI Assistant']
        }
      case 'client':
        return {
          title: 'Welcome, Client',
          message: 'Track your projects and communicate with our team.',
          features: ['Project Status', 'File Downloads', 'Feedback System', 'Support Chat']
        }
      default:
        return {
          title: 'Welcome to VetWraps',
          message: 'Please sign in to access your dashboard.',
          features: []
        }
    }
  }

  if (user && isLoaded) {
    const userRole = user.publicMetadata?.role || 'client'
    const roleInfo = getRoleBasedMessage(userRole)
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md glass rounded-2xl p-8 border border-glass"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center mb-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-blue to-accent-amber flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-white">V</span>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">{roleInfo.title}</h2>
            <p className="text-white/70">{roleInfo.message}</p>
          </div>

          {roleInfo.features.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <h3 className="text-sm font-semibold text-white/90 mb-3">Your Access Includes:</h3>
              <div className="space-y-2">
                {roleInfo.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                    {feature}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={() => window.location.href = `/${userRole}`}
              className="w-full bg-gradient-to-r from-accent-blue to-accent-amber text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-blue/25 transition-all duration-300 transform hover:scale-105"
            >
              Access Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-white/10 text-white py-3 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300"
            >
              Continue to Website
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md glass rounded-2xl p-8 border border-glass"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-blue to-accent-amber flex items-center justify-center"
          >
            <span className="text-2xl font-bold text-white">V</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to VetWraps</h2>
          <p className="text-white/70">Sign in to access your dashboard</p>
        </div>

        {error && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-accent-blue to-accent-amber text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-accent-blue/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="w-full bg-white/10 text-white py-3 px-4 rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing Up...' : 'Create Account'}
          </button>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-white/60">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default LoginPortal
