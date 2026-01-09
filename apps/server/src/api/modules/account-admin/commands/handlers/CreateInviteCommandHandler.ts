import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateInviteCommand } from '../CreateInviteCommand';
import { InviteCreatedEvent } from '../../events/InviteCreatedEvent';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';
import { UserRole, InviteStatus } from '@fnd/domain';
import * as crypto from 'crypto';

/**
 * CreateInviteCommandHandler
 *
 * Account admin creates an invite for a new user.
 * Generates token, hashes it, and queues email.
 *
 * Flow:
 * 1. Validate email not super-admin
 * 2. Validate role whitelist (only owner/admin/member)
 * 3. Check if user already exists with this email
 * 4. Check if active invite already exists
 * 5. Generate token and hash it
 * 6. Create invite record
 * 7. Emit InviteCreatedEvent (triggers email worker)
 */
@CommandHandler(CreateInviteCommand)
export class CreateInviteCommandHandler implements ICommandHandler<CreateInviteCommand, string> {
  constructor(
    @Inject('IInviteRepository') private readonly inviteRepository: any,
    @Inject('IUserRepository') private readonly userRepository: any,
    @Inject('IConfigurationService') private readonly configService: IConfigurationService,
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateInviteCommand): Promise<string> {
    const { email, role, workspaceIds, createdBy, createdByRole, accountId } = command;

    this.logger.info('Creating invite', {
      operation: 'account-admin.create_invite.start',
      module: 'CreateInviteCommandHandler',
      email,
      role,
      workspaceIds,
      createdBy,
    });

    // Validate email not super-admin
    if (this.configService.isSuperAdminEmail(email)) {
      throw new BadRequestException('Cannot invite super-admin email');
    }

    // Validate role whitelist (reject SUPER_ADMIN)
    if (![UserRole.OWNER, UserRole.ADMIN, UserRole.MEMBER].includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Only owner, admin, member are allowed.`);
    }

    // Hierarchy validation: admin cannot invite as owner
    if (createdByRole === UserRole.ADMIN && role === UserRole.OWNER) {
      throw new BadRequestException('Admin cannot invite users with Owner role');
    }

    // Check if user already exists with this email
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if active invite already exists
    const existingInvite = await this.inviteRepository.findActiveByEmail(accountId, email);
    if (existingInvite) {
      throw new ConflictException('Active invite already exists for this email');
    }

    // Generate token and hash it (use crypto instead of bcrypt for faster generation)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invite
    const invite = await this.inviteRepository.create({
      accountId,
      email,
      role,
      workspaceIds,
      tokenHash,
      expiresAt,
      status: InviteStatus.PENDING,
      createdBy,
    });

    this.logger.info('Invite created', {
      operation: 'account-admin.create_invite.created',
      module: 'CreateInviteCommandHandler',
      inviteId: invite.id,
      email,
    });

    // Emit event for email worker
    const event = new InviteCreatedEvent(invite.id, accountId, email, role, token, expiresAt);
    this.eventBus.publish(event);

    this.logger.info('Invite creation completed', {
      operation: 'account-admin.create_invite.success',
      module: 'CreateInviteCommandHandler',
      inviteId: invite.id,
    });

    return invite.id;
  }
}
