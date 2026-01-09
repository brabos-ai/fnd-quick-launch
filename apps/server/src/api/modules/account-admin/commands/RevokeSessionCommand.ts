import { ICommand } from '@fnd/contracts';

/**
 * RevokeSessionCommand
 *
 * Account admin revokes a specific user session.
 * Validates that the session belongs to a user in the same account.
 */
export class RevokeSessionCommand implements ICommand {
  public readonly type = 'RevokeSessionCommand';

  constructor(
    public readonly sessionId: string,
    public readonly revokedBy: string,
    public readonly accountId: string,
  ) {}
}
