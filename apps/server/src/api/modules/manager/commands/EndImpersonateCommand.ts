import { ICommand } from '@fnd/contracts';

/**
 * EndImpersonateCommand
 *
 * Ends an active impersonation session.
 */
export class EndImpersonateCommand implements ICommand {
  public readonly type = 'EndImpersonateCommand';

  constructor(
    public readonly impersonateSessionId: string,
  ) {}
}
