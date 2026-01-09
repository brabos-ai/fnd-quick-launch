import { ICommand } from '@fnd/contracts';
import { UserRole } from '@fnd/domain';

/**
 * UpdateUserRoleCommand
 *
 * Account admin changes user role (owner/admin/member).
 * Validates hierarchy: admin can't elevate to owner, can't change owner role.
 */
export class UpdateUserRoleCommand implements ICommand {
  public readonly type = 'UpdateUserRoleCommand';

  constructor(
    public readonly userId: string,
    public readonly role: UserRole,
    public readonly changedBy: string,
    public readonly changedByRole: UserRole,
    public readonly accountId: string,
  ) {}
}
