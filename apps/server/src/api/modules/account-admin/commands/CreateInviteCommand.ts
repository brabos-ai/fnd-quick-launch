import { ICommand } from '@fnd/contracts';
import { UserRole } from '@fnd/domain';

/**
 * CreateInviteCommand
 *
 * Account admin creates an invite for a new user.
 * Generates token, hashes it, and queues email.
 */
export class CreateInviteCommand implements ICommand {
  public readonly type = 'CreateInviteCommand';

  constructor(
    public readonly email: string,
    public readonly role: UserRole,
    public readonly workspaceIds: string[],
    public readonly createdBy: string,
    public readonly createdByRole: UserRole,
    public readonly accountId: string,
  ) {}
}
