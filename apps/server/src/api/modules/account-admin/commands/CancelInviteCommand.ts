import { ICommand } from '@fnd/contracts';

/**
 * CancelInviteCommand
 *
 * Account admin cancels a pending invite.
 * Validates that invite belongs to the same account.
 */
export class CancelInviteCommand implements ICommand {
  public readonly type = 'CancelInviteCommand';

  constructor(
    public readonly inviteId: string,
    public readonly canceledBy: string,
    public readonly accountId: string,
  ) {}
}
