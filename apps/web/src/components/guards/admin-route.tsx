import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

/**
 * AdminRoute guard component
 *
 * Protects routes that require super-admin, owner or admin role.
 * Redirects to login if not authenticated.
 * Redirects to dashboard if authenticated but not admin.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  // Check if user has admin access: super-admin OR owner/admin at user level
  const isAdmin =
    user?.role === 'super-admin' ||
    user?.role === 'owner' ||
    user?.role === 'admin'

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but not admin → redirect to dashboard
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  // Admin user → render children
  return <>{children}</>
}

AdminRoute.displayName = "AdminRoute"
