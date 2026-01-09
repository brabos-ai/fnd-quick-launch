import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'
import type { User, LoginDto, AuthResponse } from '@/types'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  login: (data: LoginDto) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      login: async (data: LoginDto) => {
        try {
          const response = await api.post<AuthResponse>('/auth/signin', data)
          const { user, accessToken, refreshToken } = response.data

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          })

          toast.success('Login realizado com sucesso!')
        } catch (error: any) {
          console.error('Login error:', error)
          const message = error.response?.data?.message || error.message || 'Erro ao fazer login'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        try {
          api.post('/auth/logout').catch(console.error)
        } catch (error) {
          console.error('Logout error:', error)
        }

        get().clearAuth()
        toast.success('Logout realizado com sucesso!')
      },

      setUser: (user) =>
        set({
          user,
        }),
    }),
    {
      name: 'fnd-manager-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
