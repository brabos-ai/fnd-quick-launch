import axios from 'axios'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const AUTH_STORAGE_KEY = 'fnd-manager-auth'

// Create axios instance for regular API calls
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Separate axios instance for auth refresh (no interceptors to avoid recursion)
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper to get auth state from localStorage
const getAuthState = () => {
  try {
    const authStore = localStorage.getItem(AUTH_STORAGE_KEY)
    if (authStore) {
      return JSON.parse(authStore)?.state || null
    }
  } catch (error) {
    console.error('[API] Failed to parse auth store:', error)
  }
  return null
}

// Helper to update tokens in localStorage
const updateTokens = (accessToken: string, refreshToken: string) => {
  try {
    const authStore = localStorage.getItem(AUTH_STORAGE_KEY)
    if (authStore) {
      const parsed = JSON.parse(authStore)
      parsed.state.accessToken = accessToken
      parsed.state.refreshToken = refreshToken
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed))
      return true
    }
  } catch (error) {
    console.error('[API] Failed to update tokens:', error)
  }
  return false
}

// Helper to clear auth and redirect to login
const clearAuthAndRedirect = () => {
  console.log('[API] Clearing auth and redirecting to login')
  localStorage.removeItem(AUTH_STORAGE_KEY)
  window.location.replace('/login')
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authState = getAuthState()

    if (authState?.accessToken) {
      config.headers.Authorization = `Bearer ${authState.accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and token refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      // Enhanced error handling for better user experience
      if (error.response?.data) {
        const errorData = error.response.data

        // Handle validation errors (400 with array of messages)
        if (error.response.status === 400 && Array.isArray(errorData.message)) {
          error.message = errorData.message.join(', ')
        }
        // Handle single error messages
        else if (errorData.message && typeof errorData.message === 'string') {
          error.message = errorData.message
        }
      }

      // Show error toast for non-401 errors
      const message = error.message || 'Ocorreu um erro. Tente novamente.'
      toast.error(message)

      return Promise.reject(error)
    }

    // If already retried, don't try again
    if (originalRequest?._retry) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    // If another request is already refreshing, queue this one
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => {
          // Get fresh token after refresh
          const authState = getAuthState()
          if (authState?.accessToken && originalRequest) {
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${authState.accessToken}`
          }
          return api(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    // Mark as retrying and set refreshing flag
    if (originalRequest) {
      originalRequest._retry = true
    }
    isRefreshing = true

    // Get refresh token from store
    const authState = getAuthState()
    const refreshToken = authState?.refreshToken

    if (!refreshToken) {
      console.log('[API] No refresh token available')
      isRefreshing = false
      processQueue(new Error('No refresh token'))
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    try {
      console.log('[API] Attempting token refresh...')

      // Use refreshApi (without interceptors) to avoid recursion
      const response = await refreshApi.post('/auth/refresh', { refreshToken })
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data

      console.log('[API] Token refresh successful')

      // Update tokens in localStorage
      updateTokens(newAccessToken, newRefreshToken)

      // Update authorization header for original request
      if (originalRequest) {
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      }

      // Process queued requests
      processQueue(null)
      isRefreshing = false

      // Retry original request
      return api(originalRequest)
    } catch (refreshError) {
      console.error('[API] Token refresh failed:', refreshError)

      // Process queued requests with error
      processQueue(refreshError as Error)
      isRefreshing = false

      // Clear auth and redirect to login
      clearAuthAndRedirect()

      return Promise.reject(refreshError)
    }
  }
)

export default api
