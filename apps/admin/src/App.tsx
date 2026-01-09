import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useUIStore } from './stores/ui-store'
import { ManagerShell } from './components/layout/manager-shell'
import { ProtectedRoute } from './components/guards/protected-route'
import { LoginPage } from './pages/login'
import { UsersPage } from './pages/users'
import { UserDetailsPage } from './pages/user-details'
import { MetricsPage } from './pages/metrics'
import { OverviewPage } from './pages/metrics/overview'
import { FinancialPage } from './pages/metrics/financial'
import { CustomersPage } from './pages/metrics/customers'
import { PlansPage } from './pages/plans'
import { SubscriptionsPage } from './pages/subscriptions'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  const theme = useUIStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ManagerShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/users" replace />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailsPage />} />
            <Route path="metrics" element={<Navigate to="/metrics/overview" replace />} />
            <Route path="metrics/overview" element={<OverviewPage />} />
            <Route path="metrics/financial" element={<FinancialPage />} />
            <Route path="metrics/customers" element={<CustomersPage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  )
}

export default App
