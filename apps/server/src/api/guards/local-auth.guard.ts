import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  /**
   * Override handleRequest to propagate custom error fields (errorCode, email)
   * from UnauthorizedException thrown by LocalStrategy.
   *
   * Default behavior would strip these fields, returning generic "Unauthorized".
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If strategy threw an exception, re-throw it with all custom fields preserved
    if (err) {
      throw err;
    }

    // If no user and no error, strategy returned false (invalid credentials)
    if (!user) {
      throw info;
    }

    return user;
  }
}
