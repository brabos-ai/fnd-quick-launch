import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/lib/toast'

/**
 * Decode JWT payload without verification (client-side only)
 * Used to extract expiration time and user info from impersonate token
 */
function decodeJwtPayload(token: string): {
  exp?: number
  impersonateSessionId?: string
  email?: string
} | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

/**
 * Hook to detect impersonate tokens in URL params
 *
 * When admin opens web app with impersonate_token and session_id params:
 * 1. Decodes JWT to get expiration
 * 2. Validates token is not expired
 * 3. Saves to auth store
 * 4. Clears URL params
 * 5. Shows toast notification (once only)
 */
export function useImpersonateDetection() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setImpersonation = useAuthStore((state) => state.setImpersonation)
  const isImpersonating = useAuthStore((state) => state.isImpersonating)
  const processedRef = useRef(false)

  useEffect(() => {
    const token = searchParams.get('impersonate_token')
    const sessionId = searchParams.get('session_id')

    // Skip if already processed, already impersonating, or no params
    if (processedRef.current || isImpersonating || !token || !sessionId) {
      return
    }

    // Mark as processed to prevent duplicate execution
    processedRef.current = true

    // Decode JWT to get expiration
    const payload = decodeJwtPayload(token)

    if (!payload || !payload.exp) {
      toast.error('Token de impersonate inválido')
      navigate('/login', { replace: true })
      return
    }

    // Check if token is expired
    const expiresAt = new Date(payload.exp * 1000)
    if (expiresAt < new Date()) {
      toast.error('Sessão de impersonate expirada')
      navigate('/login', { replace: true })
      return
    }

    // Get user name from JWT (email as fallback)
    const userName = payload.email || 'Usuário'

    // Save to store
    setImpersonation(sessionId, expiresAt, userName, token)

    // Clear URL params using history.replaceState to avoid re-triggering
    window.history.replaceState({}, '', window.location.pathname)

    // Show toast only once
    toast.info(`Impersonando como ${userName}`)
  }, [searchParams, setImpersonation, navigate, isImpersonating])
}

/**
 * Mutation hook to end an impersonation session
 *
 * Calls the backend to end the session, then clears local state
 * and redirects to login page
 */
export function useEndImpersonation() {
  const navigate = useNavigate()
  const { impersonateSessionId, clearImpersonation } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      if (!impersonateSessionId) return
      await api.delete(`/manager/impersonate/${impersonateSessionId}`)
    },
    onSuccess: () => {
      clearImpersonation()
      toast.success('Impersonacao encerrada')
      navigate('/login', { replace: true })
    },
    onError: () => {
      // Even on error, clear local state and redirect
      // The session might have already expired or been ended
      clearImpersonation()
      navigate('/login', { replace: true })
    },
  })
}
