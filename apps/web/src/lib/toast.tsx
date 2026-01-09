import { toast as sonnerToast } from 'sonner'
import type { ExternalToast } from 'sonner'
import {
  AlertCircle,
  WifiOff,
  Clock,
  ShieldX,
  Lock,
  Search,
  AlertTriangle,
  RefreshCw,
  Server,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  getErrorMessage,
  isNetworkError,
  isTimeoutError,
} from './error-messages'
import type { ErrorMessageConfig } from './error-messages'
import type { ErrorResponse } from '@/types'

// Icon mapping
const ICON_MAP: Record<ErrorMessageConfig['icon'], LucideIcon> = {
  AlertCircle,
  WifiOff,
  Clock,
  ShieldX,
  Lock,
  Search,
  AlertTriangle,
  RefreshCw,
  Server,
}

// Custom styled toast content for errors
function ErrorToastContent({
  config,
  onDismiss,
}: {
  config: ErrorMessageConfig
  onDismiss?: () => void
}) {
  const Icon = ICON_MAP[config.icon]
  const hasDescription = !!config.description

  return (
    <div className={`flex ${hasDescription ? 'items-start' : 'items-center'} gap-3`}>
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-red-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[13px] font-medium text-zinc-100 leading-tight">{config.title}</p>
        {config.description && (
          <p className="text-[12px] text-zinc-400 mt-1 leading-normal">
            {config.description}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 -mr-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// Custom styled toast content for success
function SuccessToastContent({
  message,
  description,
  onDismiss,
}: {
  message: string
  description?: string
  onDismiss?: () => void
}) {
  return (
    <div className={`flex ${description ? 'items-start' : 'items-center'} gap-3`}>
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[13px] font-medium text-zinc-100 leading-tight">{message}</p>
        {description && (
          <p className="text-[12px] text-zinc-400 mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 -mr-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// Custom styled toast content for info
function InfoToastContent({
  message,
  description,
  onDismiss,
}: {
  message: string
  description?: string
  onDismiss?: () => void
}) {
  return (
    <div className={`flex ${description ? 'items-start' : 'items-center'} gap-3`}>
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-blue-500/15 flex items-center justify-center">
          <Info className="w-3.5 h-3.5 text-blue-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[13px] font-medium text-zinc-100 leading-tight">{message}</p>
        {description && (
          <p className="text-[12px] text-zinc-400 mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 -mr-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// Warning toast content
function WarningToastContent({
  message,
  description,
  onDismiss,
}: {
  message: string
  description?: string
  onDismiss?: () => void
}) {
  return (
    <div className={`flex ${description ? 'items-start' : 'items-center'} gap-3`}>
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        </div>
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[13px] font-medium text-zinc-100 leading-tight">{message}</p>
        {description && (
          <p className="text-[12px] text-zinc-400 mt-1 leading-normal">
            {description}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 -mr-1 text-zinc-500 hover:text-zinc-300 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// Toast options with custom styling
const baseToastOptions: ExternalToast = {
  className:
    'bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/80 shadow-lg rounded-lg !py-3 !px-4',
  duration: 5000,
}

// Parse axios error or error response
function parseError(error: unknown): {
  errorCode?: string
  statusCode?: number
  message?: string
} {
  // Axios error with response data
  if (error && typeof error === 'object') {
    const axiosError = error as {
      response?: { data?: ErrorResponse; status?: number }
      message?: string
    }

    if (axiosError.response?.data) {
      return {
        errorCode: axiosError.response.data.errorCode,
        statusCode: axiosError.response.data.statusCode || axiosError.response.status,
        message: axiosError.response.data.message,
      }
    }

    // Direct ErrorResponse object
    if ('errorCode' in error && 'statusCode' in error) {
      const errResponse = error as ErrorResponse
      return {
        errorCode: errResponse.errorCode,
        statusCode: errResponse.statusCode,
        message: errResponse.message,
      }
    }

    // Generic error with message
    if ('message' in error) {
      return { message: (error as { message: string }).message }
    }
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  return {}
}

/**
 * Smart toast utility with user-friendly error handling
 */
export const toast = {
  /**
   * Show error toast with smart message resolution
   * Automatically converts error codes to user-friendly messages
   */
  error: (error: unknown, options?: ExternalToast) => {
    // Handle network errors
    if (isNetworkError(error)) {
      const config = getErrorMessage('NETWORK_ERROR')
      return sonnerToast.custom(
        (id) => (
          <ErrorToastContent
            config={config}
            onDismiss={() => sonnerToast.dismiss(id)}
          />
        ),
        { ...baseToastOptions, ...options }
      )
    }

    // Handle timeout errors
    if (isTimeoutError(error)) {
      const config = getErrorMessage('TIMEOUT')
      return sonnerToast.custom(
        (id) => (
          <ErrorToastContent
            config={config}
            onDismiss={() => sonnerToast.dismiss(id)}
          />
        ),
        { ...baseToastOptions, ...options }
      )
    }

    // Parse the error
    const { errorCode, statusCode, message } = parseError(error)

    // Get user-friendly message config
    const config = getErrorMessage(errorCode, statusCode, message)

    return sonnerToast.custom(
      (id) => (
        <ErrorToastContent
          config={config}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      { ...baseToastOptions, ...options }
    )
  },

  /**
   * Show success toast
   */
  success: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.custom(
      (id) => (
        <SuccessToastContent
          message={message}
          description={description}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      { ...baseToastOptions, duration: 3000, ...options }
    )
  },

  /**
   * Show info toast
   */
  info: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.custom(
      (id) => (
        <InfoToastContent
          message={message}
          description={description}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      { ...baseToastOptions, ...options }
    )
  },

  /**
   * Show warning toast
   */
  warning: (message: string, description?: string, options?: ExternalToast) => {
    return sonnerToast.custom(
      (id) => (
        <WarningToastContent
          message={message}
          description={description}
          onDismiss={() => sonnerToast.dismiss(id)}
        />
      ),
      { ...baseToastOptions, ...options }
    )
  },

  /**
   * Show loading toast (returns dismiss function)
   */
  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, {
      ...baseToastOptions,
      duration: Infinity,
      ...options,
    })
  },

  /**
   * Dismiss a toast by id
   */
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),

  /**
   * Promise-based toast
   */
  promise: sonnerToast.promise,
}

export default toast
