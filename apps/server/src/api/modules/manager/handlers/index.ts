import { ImpersonateStartedHandler } from './ImpersonateStartedHandler';
import { ImpersonateEndedHandler } from './ImpersonateEndedHandler';
import { UserStatusChangedHandler } from './UserStatusChangedHandler';

export const EventHandlers = [
  ImpersonateStartedHandler,
  ImpersonateEndedHandler,
  UserStatusChangedHandler,
];
