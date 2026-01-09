import { ICommand } from '@fnd/contracts';

/**
 * ImpersonateCommand
 *
 * Super admin starts impersonating a target user.
 * Creates an impersonate session with 30-minute timeout.
 */
export class ImpersonateCommand implements ICommand {
  public readonly type = 'ImpersonateCommand';

  constructor(
    public readonly adminUserId: string,
    public readonly targetUserId: string,
    public readonly reason: string,
  ) {}
}
