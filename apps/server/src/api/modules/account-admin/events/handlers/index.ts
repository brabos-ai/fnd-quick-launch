import { UserRoleUpdatedHandler } from './UserRoleUpdatedHandler';
import { UserStatusUpdatedHandler } from './UserStatusUpdatedHandler';
import { SessionRevokedHandler } from './SessionRevokedHandler';
import { InviteCreatedHandler } from './InviteCreatedHandler';
import { InviteCanceledHandler } from './InviteCanceledHandler';

export const EventHandlers = [
  UserRoleUpdatedHandler,
  UserStatusUpdatedHandler,
  SessionRevokedHandler,
  InviteCreatedHandler,
  InviteCanceledHandler,
];
