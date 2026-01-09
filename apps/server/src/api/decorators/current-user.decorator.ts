import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@fnd/domain';

/**
 * Decorator para extrair o usuário autenticado da requisição.
 *
 * O usuário é populado pelo JWT strategy após autenticação bem-sucedida.
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
