import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Pages
import LandingPage       from './pages/LandingPage'
import AuthPage          from './pages/AuthPage'
import DashboardPage     from './pages/DashboardPage'
import ResumeListPage    from './pages/ResumeListPage'
import ResumeBuilder     from './pages/ResumeBuilder'
import JobsPage          from './pages/JobsPage'
import CoursesPage       from './pages/CoursesPage'
import ProfilePage       from './pages/ProfilePage'
import NotFoundPage      from './pages/NotFoundPage'
import PublicResumePage  from './pages/PublicResumePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LegalPage         from './pages/LegalPage'

// Layout + UI
import AppLayout     from './components/layout/AppLayout'
import LoadingScreen  from './components/ui/LoadingScreen'
import ErrorBoundary  from './components/ErrorBoundary'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const hydrate = useAuthStore(s => s.hydrate)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    hydrate()
    // Small delay to avoid FOUC — zustand-persist rehydrates synchronously
    // but we want the loading screen to show on truly slow devices
    const t = setTimeout(() => setHydrated(true), 100)
    return () => clearTimeout(t)
  }, [])

  if (!hydrated) return <LoadingScreen />

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={
          <PublicRoute><AuthPage /></PublicRoute>
        } />

        {/* Protected — inside app shell */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"         element={<DashboardPage />} />
          <Route path="/resumes"           element={<ResumeListPage />} />
          <Route path="/resumes/new"       element={<ResumeBuilder />} />
          <Route path="/resumes/:id/edit"  element={<ResumeBuilder />} />
          <Route path="/jobs"              element={<JobsPage />} />
          <Route path="/courses"           element={<CoursesPage />} />
          <Route path="/profile"           element={<ProfilePage />} />
        </Route>

        {/* Legal pages */}
        <Route path="/legal/:type" element={<LegalPage />} />

        {/* Public resume share link — no auth required */}
        <Route path="/r/:token" element={<PublicResumePage />} />

        {/* Password reset — public, no auth required */}
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/forgot-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  )
}
