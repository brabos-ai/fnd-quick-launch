import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: true,
      sidebarCollapsed: false,

      setTheme: (theme) => {
        set({ theme })

        // Apply theme class to document root
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
      },

      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),

      toggleSidebarCollapse: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setSidebarOpen: (open) =>
        set({
          sidebarOpen: open,
        }),

      setSidebarCollapsed: (collapsed) =>
        set({
          sidebarCollapsed: collapsed,
        }),
    }),
    {
      name: 'fnd-quicklaunch-ui-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)

// Initialize theme on module load
const initTheme = () => {
  const store = localStorage.getItem('fnd-quicklaunch-ui-v2')
  if (store) {
    try {
      const parsed = JSON.parse(store)
      const theme = parsed.state?.theme || 'dark'

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
    } catch (error) {
      console.error('Failed to parse UI store:', error)
    }
  }
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  initTheme()

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = localStorage.getItem('fnd-quicklaunch-ui-v2')
    if (store) {
      try {
        const parsed = JSON.parse(store)
        const theme = parsed.state?.theme

        if (theme === 'system') {
          const root = document.documentElement
          root.classList.remove('light', 'dark')
          root.classList.add(e.matches ? 'dark' : 'light')
        }
      } catch (error) {
        console.error('Failed to parse UI store:', error)
      }
    }
  })
}
