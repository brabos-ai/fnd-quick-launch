import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CancelInviteCommand } from '../CancelInviteCommand';
import { InviteCanceledEvent } from '../../events/InviteCanceledEvent';
import { ILoggerService } from '@fnd/contracts';
import { InviteStatus } from '@fnd/domain';

/**
 * CancelInviteCommandHandler
 *
 * Account admin cancels a pending invite.
 * Validates that invite belongs to the same account.
 *
 * Flow:
 * 1. Validate invite exists
 * 2. Validate invite belongs to same account (multi-tenancy)
 * 3. Validate invite is still pending
 * 4. Mark invite as canceled
 * 5. Emit InviteCanceledEvent for audit logging
 */
@CommandHandler(CancelInviteCommand)
export class CancelInviteCommandHandler implements ICommandHandler<CancelInviteCommand, void> {
  constructor(
    @Inject('IInviteRepository') private readonly inviteRepository: any,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CancelInviteCommand): Promise<void> {
    const { inviteId, canceledBy, accountId } = command;

    this.logger.info('Canceling invite', {
      operation: 'account-admin.cancel_invite.start',
      module: 'CancelInviteCommandHandler',
      inviteId,
      canceledBy,
    });

    // Validate invite exists
    const invite = await this.inviteRepository.findById(inviteId);
    if (!invite) {
      throw new NotFoundException(`Invite not found: ${inviteId}`);
    }

    // Multi-tenancy: validate same account
    if (invite.accountId !== accountId) {
      throw new ForbiddenException('Cannot cancel invite from different account');
    }

    // Validate invite is still pending
    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel invite with status: ${invite.status}`);
    }

    // Mark invite as canceled
    await this.inviteRepository.updateStatus(inviteId, InviteStatus.CANCELED);

    this.logger.info('Invite canceled', {
      operation: 'account-admin.cancel_invite.canceled',
      module: 'CancelInviteCommandHandler',
      inviteId,
    });

    // Emit event for audit logging
    const event = new InviteCanceledEvent(inviteId, accountId, canceledBy);
    this.eventBus.publish(event);

    this.logger.info('Invite cancellation completed', {
      operation: 'account-admin.cancel_invite.success',
      module: 'CancelInviteCommandHandler',
      inviteId,
    });
  }
}
