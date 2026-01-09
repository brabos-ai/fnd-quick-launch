import { ICommand } from '@fnd/contracts';
import { EntityStatus } from '@fnd/domain';

/**
 * UpdateUserStatusCommand
 *
 * Admin changes user status (active/inactive).
 * If set to inactive, all user sessions are revoked.
 */
export class UpdateUserStatusCommand implements ICommand {
  public readonly type = 'UpdateUserStatusCommand';

  constructor(
    public readonly userId: string,
    public readonly status: EntityStatus,
    public readonly changedBy: string,
  ) {}
}
