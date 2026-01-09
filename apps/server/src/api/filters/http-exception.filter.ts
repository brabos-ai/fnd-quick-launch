import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse, DisplayType } from '@fnd/domain';

const STATUS_TO_DISPLAY_TYPE: Record<number, DisplayType> = {
  400: 'toast',
  401: 'page',
  403: 'modal',
  404: 'inline',
  429: 'toast',
  500: 'toast'
};

interface HttpExceptionResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Check if exception already has ErrorResponse structure
    if (this.isErrorResponse(exceptionResponse)) {
      return response.status(status).json(exceptionResponse);
    }

    // Build ErrorResponse from standard HttpException
    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : this.extractMessage(exceptionResponse, exception.message);

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      errorCode: this.getErrorCode(status),
      displayType: STATUS_TO_DISPLAY_TYPE[status] || 'toast',
      details: typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? this.extractDetails(exceptionResponse)
        : undefined
    };

    return response.status(status).json(errorResponse);
  }

  private extractMessage(response: string | object, fallback: string): string | string[] {
    if (typeof response === 'object' && 'message' in response) {
      return (response as HttpExceptionResponse).message;
    }
    return fallback;
  }

  private extractDetails(response: string | object): Record<string, unknown> | undefined {
    if (typeof response === 'object' && response !== null) {
      return { ...(response as Record<string, unknown>) };
    }
    return undefined;
  }

  private isErrorResponse(response: string | object): response is ErrorResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'statusCode' in response &&
      'message' in response &&
      'errorCode' in response &&
      'displayType' in response
    );
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
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
      504: 'GATEWAY_TIMEOUT'
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}
