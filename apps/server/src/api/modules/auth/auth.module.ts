import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SharedModule } from '../../../shared/shared.module';
import { AuthController } from './auth.controller';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { RateLimitService } from './services/rate-limit.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { RateLimitGuard } from '../../guards/rate-limit.guard';
import { SignUpCommandHandler } from './commands/SignUpCommand';
import { SignInCommandHandler } from './commands/SignInCommand';
import { RefreshTokenCommandHandler } from './commands/RefreshTokenCommand';
import { ForgotPasswordCommandHandler } from './commands/ForgotPasswordCommand';
import { ResetPasswordCommandHandler } from './commands/ResetPasswordCommand';
import { VerifyEmailCommandHandler } from './commands/VerifyEmailCommand';
import { ResendVerificationCommandHandler } from './commands/ResendVerificationCommand';
import { UpdateProfileCommandHandler } from './commands/UpdateProfileCommand';
import { AccountCreatedEventHandler } from './events/handlers/AccountCreatedEventHandler';
import { LoginSuccessEventHandler } from './events/handlers/LoginSuccessEventHandler';
import { LoginFailureEventHandler } from './events/handlers/LoginFailureEventHandler';
import { PasswordResetRequestedEventHandler } from './events/handlers/PasswordResetRequestedEventHandler';
import { PasswordChangedEventHandler } from './events/handlers/PasswordChangedEventHandler';
import { VerificationEmailResentEventHandler } from './events/handlers/VerificationEmailResentEventHandler';

@Module({
  imports: [
    CqrsModule,
    SharedModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Services
    PasswordService,
    TokenService,
    RateLimitService,

    // Strategies
    LocalStrategy,
    JwtStrategy,

    // Guards
    JwtAuthGuard,
    LocalAuthGuard,
    RateLimitGuard,

    // Command Handlers
    SignUpCommandHandler,
    SignInCommandHandler,
    RefreshTokenCommandHandler,
    ForgotPasswordCommandHandler,
    ResetPasswordCommandHandler,
    VerifyEmailCommandHandler,
    ResendVerificationCommandHandler,
    UpdateProfileCommandHandler,

    // Event Handlers
    AccountCreatedEventHandler,
    LoginSuccessEventHandler,
    LoginFailureEventHandler,
    PasswordResetRequestedEventHandler,
    PasswordChangedEventHandler,
    VerificationEmailResentEventHandler,
  ],
  exports: [
    // Export strategies and guards for use in other modules (e.g., ManagerModule)
    JwtStrategy,
    JwtAuthGuard,
    PassportModule,
    TokenService,
  ],
})
export class AuthModule {}