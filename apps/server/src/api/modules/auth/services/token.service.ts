import { Injectable, Inject } from '@nestjs/common';
import { IConfigurationService } from '@fnd/contracts';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

interface JwtPayload {
  userId: string;
  accountId: string;
  email: string;
  sessionId: string;
  impersonateSessionId?: string;
}

@Injectable()
export class TokenService {
  constructor(
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
  ) {}

  /**
   * Generate an access token (JWT) with 15 minute expiry
   * @param userId - The user ID
   * @param accountId - The account ID
   * @param email - The user email
   * @param sessionId - The session ID for revocation check
   * @param impersonateSessionId - Optional impersonation session ID (when admin is impersonating user)
   * @returns The signed JWT token
   */
  generateAccessToken(
    userId: string,
    accountId: string,
    email: string,
    sessionId: string,
    impersonateSessionId?: string,
  ): string {
    const payload: JwtPayload = {
      userId,
      accountId,
      email,
      sessionId,
      ...(impersonateSessionId && { impersonateSessionId }),
    };

    return jwt.sign(payload, this.configService.getJwtSecret(), {
      expiresIn: '15m',
      issuer: 'fnd-quicklaunch',
      audience: 'fnd-quicklaunch-api',
    });
  }

  /**
   * Generate a refresh token (opaque random token)
   * @returns A random hex token
   */
  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify and decode an access token
   * @param token - The JWT token to verify
   * @returns The decoded payload or null if invalid
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.configService.getJwtSecret(), {
        issuer: 'fnd-quicklaunch',
        audience: 'fnd-quicklaunch-api',
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      return null;
    }
  }
}
