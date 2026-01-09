import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  Req,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { RateLimitGuard, RateLimit } from '../../guards/rate-limit.guard';
import {
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  UpdateProfileDto,
  RequestEmailChangeDto,
  ConfirmEmailChangeDto,
} from './dtos';
import {
  SignUpCommand,
  SignInCommand,
  RefreshTokenCommand,
  ForgotPasswordCommand,
  ResetPasswordCommand,
  VerifyEmailCommand,
  ResendVerificationCommand,
  UpdateProfileCommand,
  RequestEmailChangeCommand,
  ConfirmEmailChangeCommand,
} from './commands';
import { SessionRepository, InviteRepository, UserRepository } from '@fnd/database';
import { Inject, BadRequestException } from '@nestjs/common';
import { InviteStatus } from '@fnd/domain';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('ISessionRepository')
    private readonly sessionRepository: SessionRepository,
    @Inject('IInviteRepository')
    private readonly inviteRepository: InviteRepository,
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  @Post('signup')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 60 })
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignUpDto, @Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.commandBus.execute(
      new SignUpCommand(dto.email, dto.password, dto.fullName, dto.workspaceName, ipAddress, userAgent, dto.inviteToken)
    );
  }

  // GET /auth/invite/:token - Validate invite and return email for signup form
  @Get('invite/:token')
  async validateInvite(@Param('token') token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const invite = await this.inviteRepository.findByToken(tokenHash);

    if (!invite) {
      throw new NotFoundException('Invalid invite token');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite has already been used or canceled');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return {
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt.toISOString(),
    };
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard, RateLimitGuard)
  @RateLimit({ limit: 5, windowSeconds: 60 })
  @HttpCode(HttpStatus.OK)
  async signin(@Req() req: any, @Body() dto: SignInDto) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.commandBus.execute(new SignInCommand(req.user, ipAddress, userAgent));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any) {
    // Get current session from refresh token if provided
    // For simplicity, revoke all sessions for the user
    await this.sessionRepository.revokeAllByUserId(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 60 })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.commandBus.execute(new ForgotPasswordCommand(dto.email));
    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.commandBus.execute(new ResetPasswordCommand(dto.token, dto.newPassword));
    return { message: 'Password reset successfully.' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.commandBus.execute(new VerifyEmailCommand(dto.token));
    return { message: 'Email verified successfully.' };
  }

  @Post('resend-verification')
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 60 })
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    await this.commandBus.execute(new ResendVerificationCommand(dto.email));
    return { message: 'If the email exists and is not verified, a verification link has been sent.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return {
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        emailVerified: req.user.emailVerified,
        accountId: req.user.accountId,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    await this.commandBus.execute(
      new UpdateProfileCommand(req.user.id, dto.fullName)
    );

    // Fetch updated user data from database
    const updatedUser = await this.userRepository.findById(req.user.id);
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        emailVerified: updatedUser.emailVerified,
        accountId: updatedUser.accountId,
        role: req.user.role, // Role comes from JWT
        createdAt: updatedUser.createdAt,
      },
    };
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: any) {
    const sessions = await this.sessionRepository.findByUserId(req.user.id);
    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        deviceName: session.deviceName,
        ipAddress: session.ipAddress,
        lastActivityAt: session.lastActivityAt,
        createdAt: session.createdAt,
      })),
    };
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async revokeSession(@Req() req: any, @Param('id') sessionId: string) {
    // Verify session exists
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Verify session belongs to user before revoking
    if (session.userId !== req.user.id) {
      throw new ForbiddenException('You can only revoke your own sessions');
    }

    await this.sessionRepository.revokeById(sessionId);
    return { message: 'Session revoked successfully' };
  }

  @Post('request-email-change')
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @RateLimit({ limit: 3, windowSeconds: 3600 })
  @HttpCode(HttpStatus.OK)
  async requestEmailChange(@Req() req: any, @Body() dto: RequestEmailChangeDto) {
    await this.commandBus.execute(
      new RequestEmailChangeCommand(req.user.id, dto.newEmail, dto.currentPassword)
    );
    return { message: 'Link de verificação enviado para o novo endereço de e-mail.' };
  }

  @Post('confirm-email-change')
  @HttpCode(HttpStatus.OK)
  async confirmEmailChange(@Body() dto: ConfirmEmailChangeDto, @Req() req?: any) {
    const sessionId = req?.user?.sessionId || null;
    await this.commandBus.execute(new ConfirmEmailChangeCommand(dto.token, sessionId));
    return { message: 'E-mail atualizado com sucesso.' };
  }
}