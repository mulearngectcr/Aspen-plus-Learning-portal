import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

function LoadingScreen() { return <main className="grid min-h-screen place-items-center text-sm text-stone-600">Loading your bootcamp…</main> }

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen />
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}

export function RequireAdmin() {
  const { profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  // UX only. Every Express admin endpoint must independently verify is_admin.
  return profile?.is_admin ? <Outlet /> : <Navigate to="/" replace />
}
