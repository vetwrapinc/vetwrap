import { useAuth, useUser } from '@clerk/clerk-react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

// Pages
import LandingPage from './pages/LandingPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import ClientDashboard from './pages/client/ClientDashboard'
import LoadingSpinner from './components/ui/LoadingSpinner'

// API
import { api } from './lib/api'

function App() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isSignedIn && user) {
        try {
          const response = await api.get('/auth/me')
          setUserRole(response.data.role)
        } catch (error) {
          console.error('Failed to fetch user role:', error)
        }
      }
      setIsLoading(false)
    }

    if (isLoaded) {
      fetchUserRole()
    }
  }, [isSignedIn, user, isLoaded])

  if (!isLoaded || isLoading) {
    return <LoadingSpinner />
  }

  if (!isSignedIn) {
    return (
      <>
        <LandingPage />
        <Toaster position="top-right" />
      </>
    )
  }

  // Role-based routing
  const getDashboardRoute = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />
      case 'employee':
        return <EmployeeDashboard />
      case 'client':
        return <ClientDashboard />
      default:
        return <Navigate to="/" replace />
    }
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={getDashboardRoute()} />
        <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />} />
        <Route path="/employee" element={userRole === 'employee' ? <EmployeeDashboard /> : <Navigate to="/" replace />} />
        <Route path="/client" element={userRole === 'client' ? <ClientDashboard /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  )
}

export default App

