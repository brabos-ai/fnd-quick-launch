import { AccountTable } from './AccountTable';
import { WorkspaceTable } from './WorkspaceTable';
import { WorkspaceUserTable } from './WorkspaceUserTable';
import { UserTable } from './UserTable';
import { AuditLogTable } from './AuditLogTable';
import { WebhookEventTable } from './WebhookEventTable';
import { PlanTable } from './PlanTable';
import { PlanPriceTable } from './PlanPriceTable';
import { SubscriptionTable } from './SubscriptionTable';
import { SessionsTable } from './SessionsTable';
import { LoginAttemptsTable } from './LoginAttemptsTable';
import { AuthTokensTable } from './AuthTokensTable';
import { ImpersonateSessionsTable } from './ImpersonateSessionsTable';
import { InvitesTable } from './InvitesTable';
import { EmailChangeRequestsTable } from './EmailChangeRequestsTable';

export interface Database {
  accounts: AccountTable;
  workspaces: WorkspaceTable;
  workspace_users: WorkspaceUserTable;
  users: UserTable;
  audit_logs: AuditLogTable;
  webhook_events: WebhookEventTable;
  plans: PlanTable;
  plan_prices: PlanPriceTable;
  subscriptions: SubscriptionTable;
  sessions: SessionsTable;
  login_attempts: LoginAttemptsTable;
  auth_tokens: AuthTokensTable;
  impersonate_sessions: ImpersonateSessionsTable;
  invites: InvitesTable;
  email_change_requests: EmailChangeRequestsTable;
}
