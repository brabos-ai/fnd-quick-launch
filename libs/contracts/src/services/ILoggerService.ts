export interface ILoggerService {
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

export interface LogContext {
  operation?: string;
  module?: string;
  function?: string;

  userId?: string;
  accountId?: string;
  email?: string;
  sessionId?: string;
  requestId?: string;

  userObject?: Record<string, any>;
  requestObject?: Record<string, any>;
  responseObject?: Record<string, any>;
  errorObject?: any;
  dataObject?: Record<string, any>;

  duration?: number;
  statusCode?: number;

  [key: string]: any;
}