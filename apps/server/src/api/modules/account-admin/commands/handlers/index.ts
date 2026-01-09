import { UpdateUserRoleCommandHandler } from './UpdateUserRoleCommandHandler';
import { UpdateUserStatusCommandHandler } from './UpdateUserStatusCommandHandler';
import { RevokeSessionCommandHandler } from './RevokeSessionCommandHandler';
import { RevokeAllSessionsCommandHandler } from './RevokeAllSessionsCommandHandler';
import { CreateInviteCommandHandler } from './CreateInviteCommandHandler';
import { CancelInviteCommandHandler } from './CancelInviteCommandHandler';

export const CommandHandlers = [
  UpdateUserRoleCommandHandler,
  UpdateUserStatusCommandHandler,
  RevokeSessionCommandHandler,
  RevokeAllSessionsCommandHandler,
  CreateInviteCommandHandler,
  CancelInviteCommandHandler,
];
