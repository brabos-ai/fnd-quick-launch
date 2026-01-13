import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '@fnd/domain';
import { UserRepository, LoginAttemptRepository } from '@fnd/database';
import { PasswordService } from '../services/password.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
    @Inject('ILoginAttemptRepository')
    private readonly loginAttemptRepository: LoginAttemptRepository,
    private readonly passwordService: PasswordService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: any, email: string, password: string): Promise<User> {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Check if account is locked
    const lockout = await this.loginAttemptRepository.findLockoutByEmail(email);
    if (lockout) {
      throw new UnauthorizedException(
        `Account locked due to too many failed attempts. Try again after ${lockout.lockedUntil?.toISOString()}`
      );
    }

    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      // Record failed attempt
      await this.loginAttemptRepository.create({
        email,
        ipAddress,
        success: false,
        lockedUntil: null,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      // Count recent failed attempts
      const failedAttempts = await this.loginAttemptRepository.countRecentByEmail(email, 15);

      // Lock account after 5 failed attempts
      if (failedAttempts >= 4) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await this.loginAttemptRepository.create({
          email,
          ipAddress,
          success: false,
          lockedUntil,
        });
        throw new UnauthorizedException('Account locked due to too many failed attempts. Try again in 15 minutes.');
      }

      // Record failed attempt
      await this.loginAttemptRepository.create({
        email,
        ipAddress,
        success: false,
        lockedUntil: null,
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is inactive');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException({
        message: 'Email não verificado. Por favor, verifique seu email antes de fazer login.',
        errorCode: 'EMAIL_NOT_VERIFIED',
        email: user.email,
      });
    }

    // Record successful attempt
    await this.loginAttemptRepository.create({
      email,
      ipAddress,
      success: true,
      lockedUntil: null,
    });

    return user;
  }
}
