// Re-export from @fnd/shared to maintain backward compatibility
// Note: ApiResponse and PaginatedResponse available from '@fnd/shared' but not re-exported here.
// Import directly from '@fnd/shared' if needed.
import type { DisplayType, ErrorResponse } from '@fnd/shared'

export type { DisplayType, ErrorResponse }

/**
 * Type for Axios errors that contain an API ErrorResponse.
 * Use this to type catch blocks and onError callbacks in mutations/queries.
 *
 * @example
 * ```ts
 * onError: (error: AxiosErrorWithResponse) => {
 *   const message = error.response?.data?.message || 'Erro desconhecido'
 *   toast.error(message)
 * }
 * ```
 */
export interface AxiosErrorWithResponse<T = ErrorResponse> {
  response?: {
    data?: T
    status?: number
  }
  message?: string
}
