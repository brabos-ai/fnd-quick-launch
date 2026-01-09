import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { EndImpersonateCommand } from '../EndImpersonateCommand';
import { ImpersonateEndedEvent } from '../../events/ImpersonateEndedEvent';
import { ILoggerService } from '@fnd/contracts';

/**
 * EndImpersonateCommandHandler
 *
 * Ends an active impersonation session.
 *
 * Flow:
 * 1. Find active session
 * 2. Set ended_at timestamp
 * 3. Emit ImpersonateEndedEvent for audit logging
 */
@CommandHandler(EndImpersonateCommand)
export class EndImpersonateCommandHandler implements ICommandHandler<EndImpersonateCommand, void> {
  constructor(
    @Inject('IImpersonateSessionRepository') private readonly impersonateSessionRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: EndImpersonateCommand): Promise<void> {
    const { impersonateSessionId } = command;

    this.logger.info('Ending impersonation session', {
      operation: 'manager.end_impersonate.start',
      module: 'EndImpersonateCommandHandler',
      sessionId: impersonateSessionId,
    });

    // Find session by ID (using raw query since we need to fetch by ID)
    // Note: You may need to add a findById method to ImpersonateSessionRepository
    const session = await this.impersonateSessionRepository.findById(impersonateSessionId);
    if (!session) {
      throw new NotFoundException(`Impersonate session not found: ${impersonateSessionId}`);
    }

    if (session.endedAt) {
      this.logger.warn('Impersonate session already ended', {
        operation: 'manager.end_impersonate.already_ended',
        module: 'EndImpersonateCommandHandler',
        sessionId: impersonateSessionId,
      });
      return;
    }

    // End the session
    await this.impersonateSessionRepository.endSession(impersonateSessionId);

    // Emit event for audit logging
    const event = new ImpersonateEndedEvent(
      session.adminUserId,
      session.targetUserId,
      impersonateSessionId,
    );
    this.eventBus.publish(event);

    this.logger.info('Impersonation session ended successfully', {
      operation: 'manager.end_impersonate.success',
      module: 'EndImpersonateCommandHandler',
      sessionId: impersonateSessionId,
    });
  }
}
