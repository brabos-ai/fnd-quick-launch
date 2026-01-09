/**
 * Error Messages Mapping - User-friendly error translations
 *
 * Converts technical error codes and HTTP status codes into
 * human-readable messages in Portuguese (Brazil).
 */

export interface ErrorMessageConfig {
  /** Main message displayed to the user */
  title: string
  /** Optional detailed description */
  description?: string
  /** Icon name from lucide-react */
  icon: 'AlertCircle' | 'WifiOff' | 'Clock' | 'ShieldX' | 'Lock' | 'Search' | 'AlertTriangle' | 'RefreshCw' | 'Server'
  /** Suggested action for the user */
  action?: {
    label: string
    onClick?: () => void
  }
}

/**
 * Maps error codes to user-friendly messages
 */
export const ERROR_CODE_MESSAGES: Record<string, ErrorMessageConfig> = {
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: {
    title: 'Muitas tentativas',
    description: 'Aguarde alguns segundos antes de tentar novamente.',
    icon: 'Clock',
  },

  // Authentication
  UNAUTHORIZED: {
    title: 'Sessao expirada',
    description: 'Faca login novamente para continuar.',
    icon: 'Lock',
  },
  EMAIL_NOT_VERIFIED: {
    title: 'E-mail nao verificado',
    description: 'Verifique sua caixa de entrada e confirme seu e-mail.',
    icon: 'AlertCircle',
  },
  INVALID_CREDENTIALS: {
    title: 'Credenciais invalidas',
    description: 'E-mail ou senha incorretos.',
    icon: 'ShieldX',
  },
  ACCOUNT_LOCKED: {
    title: 'Conta bloqueada',
    description: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    icon: 'Lock',
  },
  SESSION_EXPIRED: {
    title: 'Sessao expirada',
    description: 'Sua sessao expirou. Faca login novamente.',
    icon: 'Clock',
  },

  // Authorization
  FORBIDDEN: {
    title: 'Acesso negado',
    description: 'Voce nao tem permissao para acessar este recurso.',
    icon: 'ShieldX',
  },
  INSUFFICIENT_PERMISSIONS: {
    title: 'Permissao insuficiente',
    description: 'Voce precisa de permissoes adicionais para esta acao.',
    icon: 'ShieldX',
  },

  // Validation
  VALIDATION_ERROR: {
    title: 'Dados invalidos',
    description: 'Verifique os campos e tente novamente.',
    icon: 'AlertCircle',
  },

  // Resource errors
  NOT_FOUND: {
    title: 'Nao encontrado',
    description: 'O recurso solicitado nao existe ou foi removido.',
    icon: 'Search',
  },
  CONFLICT: {
    title: 'Conflito de dados',
    description: 'Este registro ja existe ou foi modificado.',
    icon: 'AlertTriangle',
  },
  UNPROCESSABLE_ENTITY: {
    title: 'Operacao invalida',
    description: 'Nao foi possivel processar esta solicitacao.',
    icon: 'AlertCircle',
  },

  // Server errors
  INTERNAL_SERVER_ERROR: {
    title: 'Erro interno',
    description: 'Algo deu errado. Tente novamente em alguns instantes.',
    icon: 'Server',
  },
  BAD_GATEWAY: {
    title: 'Servidor indisponivel',
    description: 'O servidor esta temporariamente fora do ar.',
    icon: 'Server',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Servico indisponivel',
    description: 'Estamos em manutencao. Volte em breve.',
    icon: 'Server',
  },
  GATEWAY_TIMEOUT: {
    title: 'Tempo esgotado',
    description: 'O servidor demorou muito para responder.',
    icon: 'Clock',
  },

  // Network
  NETWORK_ERROR: {
    title: 'Sem conexao',
    description: 'Verifique sua conexao com a internet.',
    icon: 'WifiOff',
  },
  TIMEOUT: {
    title: 'Tempo esgotado',
    description: 'A requisicao demorou muito. Tente novamente.',
    icon: 'Clock',
  },

  // Generic fallback
  UNKNOWN_ERROR: {
    title: 'Erro inesperado',
    description: 'Algo deu errado. Tente novamente.',
    icon: 'AlertTriangle',
  },
}

/**
 * Maps HTTP status codes to error codes (fallback when errorCode is missing)
 */
export const STATUS_CODE_TO_ERROR_CODE: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT',
}

/**
 * Get user-friendly error message from error response
 */
export function getErrorMessage(
  errorCode?: string,
  statusCode?: number,
  fallbackMessage?: string
): ErrorMessageConfig {
  // Try to get message by error code first
  if (errorCode && ERROR_CODE_MESSAGES[errorCode]) {
    return ERROR_CODE_MESSAGES[errorCode]
  }

  // Fallback to status code mapping
  if (statusCode) {
    const mappedCode = STATUS_CODE_TO_ERROR_CODE[statusCode]
    if (mappedCode && ERROR_CODE_MESSAGES[mappedCode]) {
      return ERROR_CODE_MESSAGES[mappedCode]
    }
  }

  // Return unknown error with optional custom message
  return {
    ...ERROR_CODE_MESSAGES.UNKNOWN_ERROR,
    description: fallbackMessage || ERROR_CODE_MESSAGES.UNKNOWN_ERROR.description,
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message === 'Network Error' ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ERR_NETWORK')
    )
  }
  return false
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('timeout') ||
      error.message.includes('ETIMEDOUT') ||
      error.message.includes('ECONNABORTED')
    )
  }
  return false
}
