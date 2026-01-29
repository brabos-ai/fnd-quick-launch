import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { AppRoutes } from './routes'
import { Toaster } from 'sonner'
import { ErrorModal } from '@/components/ui/error-modal'
import { api } from '@/lib/api'
import type { User, Workspace } from '@/types'
import { useImpersonateDetection } from '@/hooks/use-impersonate-detection'

function App() {
  const theme = useUIStore((state) => state.theme)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setWorkspaceList = useAuthStore((state) => state.setWorkspaceList)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const setCurrentWorkspace = useAuthStore((state) => state.setCurrentWorkspace)
  const setUser = useAuthStore((state) => state.setUser)

  // Detect impersonate tokens in URL (from admin panel)
  useImpersonateDetection()

  useEffect(() => {
    const root = document.documentElement
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

  // Load user data and workspaces when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const loadUserData = async () => {
      try {
        // Fetch updated user data including role
        // API returns user directly (ResponseInterceptor unwraps envelope)
        const userResponse = await api.get<User>('/auth/me')
        setUser(userResponse.data)

        // Fetch workspaces
        const workspacesResponse = await api.get<Workspace[]>('/workspaces')
        const workspaces = workspacesResponse.data

        if (workspaces.length > 0) {
          setWorkspaceList(workspaces)

          // Set current workspace if not already set
          if (!currentWorkspace) {
            setCurrentWorkspace(workspaces[0])
          }
        }
      } catch (_error) {
        // Error is already handled by API interceptor
        // No need to console.error
      }
    }

    loadUserData()
  }, [isAuthenticated, setWorkspaceList, currentWorkspace, setCurrentWorkspace, setUser])

  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: 'w-full max-w-[380px]',
          },
        }}
        gap={12}
      />
      <ErrorModal />
    </>
  )
}

export default App
