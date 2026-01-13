import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitService } from '../modules/auth/services/rate-limit.service';
import { IConfigurationService } from '@fnd/contracts';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
    }
    return descriptor;
  };
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Disable rate limiting in test environment
    if (this.configService.isTestEnvironment()) {
      return true;
    }

    const handler = context.getHandler();
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(RATE_LIMIT_KEY, handler);

    if (!rateLimitOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const path = request.route?.path || request.url;
    const key = `${ip}:${path}`;

    const allowed = await this.rateLimitService.checkRateLimit(
      key,
      rateLimitOptions.limit,
      rateLimitOptions.windowSeconds
    );

    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Muitas tentativas. Por favor, aguarde um momento.',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          displayType: 'toast',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
