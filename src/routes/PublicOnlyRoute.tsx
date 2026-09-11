import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { SessionSplash } from '@/routes/SessionSplash'

export function PublicOnlyRoute() {
  const { session, initialising } = useAuth()
  if (initialising) return <SessionSplash />
  if (session) return <Navigate to="/" replace />
  return <Outlet />
}
