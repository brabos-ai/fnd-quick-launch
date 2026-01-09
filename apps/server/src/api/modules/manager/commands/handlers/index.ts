import { ImpersonateCommandHandler } from './ImpersonateCommandHandler';
import { EndImpersonateCommandHandler } from './EndImpersonateCommandHandler';
import { UpdateUserStatusCommandHandler } from './UpdateUserStatusCommandHandler';
import { CreatePlanCommandHandler } from './CreatePlanCommandHandler';
import { UpdatePlanCommandHandler } from './UpdatePlanCommandHandler';
import { ActivatePlanCommandHandler } from './ActivatePlanCommandHandler';
import { DeactivatePlanCommandHandler } from './DeactivatePlanCommandHandler';
import { LinkStripePlanCommandHandler } from './LinkStripePlanCommandHandler';
import { ExtendAccessCommandHandler } from './ExtendAccessCommandHandler';
import { GrantTrialCommandHandler } from './GrantTrialCommandHandler';
import { ManualUpgradeCommandHandler } from './ManualUpgradeCommandHandler';
import { ManualCancelCommandHandler } from './ManualCancelCommandHandler';

export const CommandHandlers = [
  ImpersonateCommandHandler,
  EndImpersonateCommandHandler,
  UpdateUserStatusCommandHandler,
  CreatePlanCommandHandler,
  UpdatePlanCommandHandler,
  ActivatePlanCommandHandler,
  DeactivatePlanCommandHandler,
  LinkStripePlanCommandHandler,
  ExtendAccessCommandHandler,
  GrantTrialCommandHandler,
  ManualUpgradeCommandHandler,
  ManualCancelCommandHandler,
];
