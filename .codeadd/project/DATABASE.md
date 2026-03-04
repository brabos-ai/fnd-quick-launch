# Database Architecture

## Database Type
Type: PostgreSQL
Connection: Environment variable `DATABASE_URL`
Default: `postgresql://postgres:postgres@localhost:5432/fnd_dev`

## Connection Strategy
Config: `libs/database/src/kysely.ts`
Driver: pg (node-postgres) v8.11.0
Pool: Default pg.Pool configuration
SSL: Auto-detected from connection string (?sslmode=require|?ssl=true)

Factory:
```typescript
import { createDatabase } from '@fnd/database';
const db = createDatabase(process.env.DATABASE_URL);
```

## Migrations
Tool: Knex v3.0.0
Config: `libs/database/knexfile.js`
Folder: `libs/database/migrations`
Glob: `*.js`

| Action | Command |
|--------|---------|
| Run | `npm run migrate` or `knex migrate:latest` |
| Rollback | `npm run migrate:rollback` or `knex migrate:rollback` |
| Create | `npm run migrate:make <name>` |

Example:
```javascript
exports.up = function(knex) {
  return knex.schema.createTable('invites', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
    table.text('email').notNullable();
    table.string('role', 50).notNullable();
    table.specificType('workspace_ids', 'uuid[]').notNullable();
    table.text('token_hash').notNullable().unique();
    table.timestamp('expires_at', { useTz: true }).notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    // Constraints
    table.check("status IN ('pending', 'accepted', 'canceled')", [], 'chk_invites_status');

    // Indexes
    table.index('token_hash', 'idx_invites_token_hash');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('invites');
};
```

## Query Builder
ORM: Kysely v0.27.0 (Type-safe SQL)
Entities: `libs/domain/src/entities/*.ts`
Types: `libs/database/src/types/*Table.ts`
Repositories: `libs/database/src/repositories/*.ts`
Interfaces: `libs/database/src/interfaces/I*Repository.ts`

Type System:
```typescript
// libs/database/src/types/Database.ts
export interface Database {
  accounts: AccountTable;
  workspaces: WorkspaceTable;
  users: UserTable;
  audit_logs: AuditLogTable;
  plans: PlanTable;
  subscriptions: SubscriptionTable;
  sessions: SessionsTable;
  invites: InvitesTable;
  // ...
}
```

Repository Pattern:
```typescript
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return result ? this.mapToUser(result) : null;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const result = await this.db
      .insertInto('users')
      .values({
        account_id: user.accountId,
        full_name: user.fullName,
        email: user.email,
        // ...
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return this.mapToUser(result);
  }
}
```

## Naming Conventions
- Tables: snake_case (workspace_users, audit_logs)
- Columns: snake_case (account_id, created_at)
- TypeScript Types: PascalCase + Table suffix (UserTable)
- Repositories: PascalCase + Repository suffix
- Interfaces: I prefix + Repository suffix

## Key Patterns

### Multi-Tenancy
- `accounts` table is tenant root
- `workspaces` belong to accounts
- `users` belong to accounts
- `workspace_users` is bridge table

### UUID Primary Keys
```javascript
table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
```

### Timestamps with Timezone
```javascript
table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
```

### Soft Deletes
```typescript
async delete(id: string): Promise<void> {
  await this.db
    .updateTable('workspaces')
    .set({ status: 'deleted', updated_at: new Date() })
    .where('id', '=', id)
    .execute();
}
```

### JSONB for Flexible Data
```javascript
table.jsonb('settings');
table.jsonb('payload').notNullable();
```

### Database Constraints
```javascript
table.check('role IN (\'owner\', \'admin\', \'member\')', [], 'chk_users_role');
```

### Strategic Indexing
```javascript
table.index('account_id', 'idx_users_account_id');
table.index(['workspace_id', 'occurred_at'], 'idx_audit_logs_workspace_occurred');
```

## Seeding
Folder: `libs/database/seeds`
Run: `npm run seed` or `knex seed:run`
Note: Default plans seeded via migration

## Repository List (14 total)

| Repository | Interface | Purpose |
|------------|-----------|---------|
| AccountRepository | IAccountRepository | Account CRUD |
| UserRepository | IUserRepository | User management |
| WorkspaceRepository | IWorkspaceRepository | Workspace CRUD |
| WorkspaceUserRepository | IWorkspaceUserRepository | User-workspace bridge |
| AuditLogRepository | IAuditLogRepository | Event tracking |
| WebhookEventRepository | IWebhookEventRepository | Webhook storage |
| PlanRepository | IPlanRepository | Subscription plans |
| SubscriptionRepository | ISubscriptionRepository | Active subscriptions |
| SessionRepository | - | Session management |
| LoginAttemptRepository | - | Login tracking |
| AuthTokenRepository | - | Auth tokens |
| ImpersonateSessionRepository | - | Admin impersonation |
| InviteRepository | IInviteRepository | User invitations |
| EmailChangeRequestRepository | IEmailChangeRequestRepository | Email change flow |
