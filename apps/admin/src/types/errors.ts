// Mirror from backend ErrorResponse
export type DisplayType = 'toast' | 'modal' | 'page' | 'inline'

export interface ErrorResponse {
  statusCode: number
  message: string
  errorCode: string
  displayType: DisplayType
  details?: Record<string, unknown>
}

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
