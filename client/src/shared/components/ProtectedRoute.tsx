import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted)
  const { pathname } = useLocation()

  if (!token) return <Navigate to="/login" replace />
  if (!onboardingCompleted && pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }
  return <Outlet />
}
