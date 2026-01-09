import { useEffect } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { AppRoutes } from './routes'
import { Toaster } from 'sonner'
import { ErrorModal } from '@/components/ui/error-modal'
import { api } from '@/lib/api'
import type { Workspace } from '@/types'

function App() {
  const theme = useUIStore((state) => state.theme)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const setWorkspaceList = useAuthStore((state) => state.setWorkspaceList)
  const currentWorkspace = useAuthStore((state) => state.currentWorkspace)
  const setCurrentWorkspace = useAuthStore((state) => state.setCurrentWorkspace)
  const setUser = useAuthStore((state) => state.setUser)

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
        const userResponse = await api.get<{ user: any }>('/auth/me')
        setUser(userResponse.data.user)

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
      } catch (error) {
        console.error('Failed to load user data:', error)
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
