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

    // Extract custom fields from response if present (e.g., errorCode, email for EMAIL_NOT_VERIFIED)
    const customFields = typeof exceptionResponse === 'object' && exceptionResponse !== null
      ? exceptionResponse as Record<string, unknown>
      : {};

    // Build base response with standard fields
    const baseResponse: ErrorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      // Preserve custom errorCode if present, otherwise use default based on status
      errorCode: (customFields.errorCode as string) || this.getErrorCode(status),
      displayType: STATUS_TO_DISPLAY_TYPE[status] || 'toast',
      details: typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? this.extractDetails(exceptionResponse)
        : undefined
    };

    // Merge custom fields (like 'email' for EMAIL_NOT_VERIFIED) to top level
    const errorResponse = {
      ...baseResponse,
      ...this.extractCustomFields(customFields)
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
      500: 'INTERNAL_SERVER_ERROR'
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Extract custom fields from exception response, excluding standard fields.
   * This allows custom fields like 'email' for EMAIL_NOT_VERIFIED to be passed through.
   */
  private extractCustomFields(response: Record<string, unknown>): Record<string, unknown> {
    const standardFields = ['message', 'error', 'statusCode', 'errorCode'];
    const customFields: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(response)) {
      if (!standardFields.includes(key) && value !== undefined) {
        customFields[key] = value;
      }
    }

    return customFields;
  }
}
