import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ImpersonateCommand } from '../ImpersonateCommand';
import { ImpersonateStartedEvent } from '../../events/ImpersonateStartedEvent';
import { ImpersonateResponseDto } from '../../dtos/ImpersonateResponseDto';
import { ILoggerService } from '@fnd/contracts';
import { TokenService } from '../../../auth/services/token.service';
import * as crypto from 'crypto';

/**
 * ImpersonateCommandHandler
 *
 * Creates impersonation session and generates special access token.
 *
 * Flow:
 * 1. Validate target user exists and is active
 * 2. Create impersonate_session with 30-minute expiry
 * 3. Create auth session for target user
 * 4. Generate JWT access token for target user
 * 5. Emit ImpersonateStartedEvent for audit logging
 * 6. Return token + expiry
 */
@CommandHandler(ImpersonateCommand)
export class ImpersonateCommandHandler implements ICommandHandler<ImpersonateCommand, ImpersonateResponseDto> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('IImpersonateSessionRepository') private readonly impersonateSessionRepository: any,
    @Inject('ISessionRepository') private readonly sessionRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly tokenService: TokenService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ImpersonateCommand): Promise<ImpersonateResponseDto> {
    const { adminUserId, targetUserId, reason } = command;

    this.logger.info('Starting impersonation', {
      operation: 'manager.impersonate.start',
      module: 'ImpersonateCommandHandler',
      adminUserId,
      targetUserId,
    });

    // Validate target user exists and is active
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException(`Target user not found: ${targetUserId}`);
    }

    if (targetUser.status !== 'active') {
      throw new NotFoundException(`Target user is not active: ${targetUserId}`);
    }

    // Create impersonate session (30-minute timeout)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const impersonateSession = await this.impersonateSessionRepository.create({
      adminUserId,
      targetUserId,
      reason,
      expiresAt,
      startedAt: new Date(),
      endedAt: null,
    });

    this.logger.info('Impersonate session created', {
      operation: 'manager.impersonate.session_created',
      module: 'ImpersonateCommandHandler',
      sessionId: impersonateSession.id,
      adminUserId,
      targetUserId,
      expiresAt,
    });

    // Create auth session for target user (needed for JWT validation)
    const authSession = await this.sessionRepository.create({
      userId: targetUserId,
      refreshTokenHash: crypto.createHash('sha256').update(`impersonate_${impersonateSession.id}`).digest('hex'),
      ipAddress: 'impersonate',
      userAgent: `Impersonation by admin ${adminUserId}`,
      deviceName: 'Admin Impersonation',
      lastActivityAt: new Date(),
      expiresAt,
      revokedAt: null,
    });

    this.logger.info('Auth session created for impersonation', {
      operation: 'manager.impersonate.auth_session_created',
      module: 'ImpersonateCommandHandler',
      authSessionId: authSession.id,
      targetUserId,
    });

    // Generate JWT access token for target user
    const accessToken = this.tokenService.generateAccessToken(
      targetUser.id,
      targetUser.accountId,
      targetUser.email,
      authSession.id,
    );

    // Emit event for audit logging
    const event = new ImpersonateStartedEvent(
      adminUserId,
      targetUserId,
      reason,
      expiresAt,
    );
    this.eventBus.publish(event);

    this.logger.info('Impersonation started successfully', {
      operation: 'manager.impersonate.success',
      module: 'ImpersonateCommandHandler',
      impersonateSessionId: impersonateSession.id,
      authSessionId: authSession.id,
      adminUserId,
      targetUserId,
    });

    return {
      accessToken,
      sessionId: impersonateSession.id,
      expiresAt,
      targetUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.fullName,
      },
    };
  }
}
