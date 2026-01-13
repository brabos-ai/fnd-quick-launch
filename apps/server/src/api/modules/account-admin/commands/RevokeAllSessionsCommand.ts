import { ICommand } from '@fnd/contracts';

/**
 * RevokeAllSessionsCommand
 *
 * Account admin revokes all sessions for a specific user (force logout).
 * Validates that the target user belongs to the same account.
 */
export class RevokeAllSessionsCommand implements ICommand {
  public readonly type = 'RevokeAllSessionsCommand';

  constructor(
    public readonly userId: string,
    public readonly revokedBy: string,
    public readonly accountId: string,
  ) {}
}
