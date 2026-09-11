import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { SessionSplash } from '@/routes/SessionSplash'

export function ProtectedRoute() {
  const { session, initialising } = useAuth()
  const location = useLocation()

  // Hold the splash until the session check settles, so the UI never flickers
  // between the sign-in page and the dashboard.
  if (initialising) return <SessionSplash />
  if (!session) return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  return <Outlet />
}
