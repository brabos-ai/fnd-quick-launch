// Mirror from backend ErrorResponse
export type DisplayType = 'toast' | 'modal' | 'page' | 'inline'

export interface ErrorResponse {
  statusCode: number
  message: string
  errorCode: string
  displayType: DisplayType
  details?: Record<string, unknown>
}
