import { UserRole } from '../enums/UserRole';
import { Action } from './Action.enum';
import { Resource } from './Resource.enum';

export interface PermissionRule {
  global?: UserRole[];
  workspace?: UserRole[];
}

export type PermissionMatrix = {
  [resource in Resource]?: {
    [action in Action]?: PermissionRule;
  };
};

export interface AuthorizationContext {
  workspaceId?: string;
}
