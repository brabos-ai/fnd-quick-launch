import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { AdminRoute } from '@/components/guards/admin-route'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/auth/login'))
const SignupPage = lazy(() => import('@/pages/auth/signup'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/reset-password'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/verify-email'))
const EmailNotVerifiedPage = lazy(() => import('@/pages/auth/email-not-verified'))
const ConfirmEmailChangePage = lazy(() => import('@/pages/auth/confirm-email-change'))

const DashboardPage = lazy(() => import('@/pages/dashboard'))
const SettingsPage = lazy(() => import('@/pages/settings'))
const BillingPage = lazy(() => import('@/pages/billing'))

// Admin pages
const WorkspacesPage = lazy(() => import('@/pages/admin/workspaces'))
const WorkspaceSettingsPage = lazy(() => import('@/pages/admin/workspace-settings'))
const UsersManagementPage = lazy(() => import('@/pages/admin/users-management'))
const AdminSessionsPage = lazy(() => import('@/pages/admin/sessions'))
const InvitesPage = lazy(() => import('@/pages/admin/invites'))
const AuditPage = lazy(() => import('@/pages/admin/audit'))

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Auth route wrapper (redirect to dashboard if already authenticated)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeleton variant="dashboard" />}>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <LoginPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <SignupPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <ForgotPasswordPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <Suspense fallback={<PageSkeleton variant="auth" />}>
                <ResetPasswordPage />
              </Suspense>
            </AuthRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<PageSkeleton variant="auth" />}>
              <VerifyEmailPage />
            </Suspense>
          }
        />
        <Route
          path="/email-not-verified"
          element={
            <Suspense fallback={<PageSkeleton variant="auth" />}>
              <EmailNotVerifiedPage />
            </Suspense>
          }
        />
        <Route
          path="/confirm-email-change/:token"
          element={
            <Suspense fallback={<PageSkeleton variant="auth" />}>
              <ConfirmEmailChangePage />
            </Suspense>
          }
        />

        {/* App routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/billing"
          element={
            <AdminRoute>
              <BillingPage />
            </AdminRoute>
          }
        />

        {/* Admin routes - protected by AdminRoute guard */}
        <Route
          path="/admin/workspaces"
          element={
            <AdminRoute>
              <WorkspacesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/workspace/:id"
          element={
            <AdminRoute>
              <WorkspaceSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UsersManagementPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <AdminRoute>
              <AdminSessionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/invites"
          element={
            <AdminRoute>
              <InvitesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <AdminRoute>
              <AuditPage />
            </AdminRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
