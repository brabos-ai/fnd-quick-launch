/**
 * MIGRATION - Row Level Security Policies
 * Enables RLS on 6 tenant-scoped tables with automatic filtering by account_id.
 *
 * Tables with direct account_id:
 * - workspaces, users, audit_logs, subscriptions, invites
 *
 * Join table (uses subquery):
 * - workspace_users (filters via workspace.account_id)
 *
 * Admin bypass: current_setting('app.is_admin', true) = 'true'
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Tables with direct account_id column
  const directAccountTables = [
    'workspaces',
    'users',
    'audit_logs',
    'subscriptions',
    'invites'
  ];

  // Enable RLS and create policies for tables with direct account_id
  for (const table of directAccountTables) {
    await knex.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
    await knex.raw(`
      CREATE POLICY rls_${table}_tenant ON ${table}
        FOR ALL USING (
          account_id = current_setting('app.current_account_id')::uuid
          OR current_setting('app.is_admin', true) = 'true'
        )
    `);
  }

  // workspace_users: join table without direct account_id
  // Uses subquery to get account_id via workspaces table
  await knex.raw(`ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY`);
  await knex.raw(`
    CREATE POLICY rls_workspace_users_tenant ON workspace_users
      FOR ALL USING (
        workspace_id IN (
          SELECT id FROM workspaces
          WHERE account_id = current_setting('app.current_account_id')::uuid
        )
        OR current_setting('app.is_admin', true) = 'true'
      )
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // All tables that had RLS enabled
  const allTables = [
    'workspaces',
    'users',
    'audit_logs',
    'subscriptions',
    'invites',
    'workspace_users'
  ];

  // Drop policies and disable RLS for each table
  for (const table of allTables) {
    await knex.raw(`DROP POLICY IF EXISTS rls_${table}_tenant ON ${table}`);
    await knex.raw(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`);
  }
};
