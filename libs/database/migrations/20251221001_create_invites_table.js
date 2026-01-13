/**
 * Migration: Create Invites Table
 * Creates table for account-level user invitations with token-based acceptance
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('invites', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE');
      table.text('email').notNullable();
      table.string('role', 50).notNullable();
      table.specificType('workspace_ids', 'uuid[]').notNullable();
      table.text('token_hash').notNullable().unique();
      table.timestamp('expires_at', { useTz: true }).notNullable();
      table.string('status', 50).notNullable().defaultTo('pending');
      table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      // Constraints
      table.check("status IN ('pending', 'accepted', 'canceled')", [], 'chk_invites_status');
      table.check("role IN ('owner', 'admin', 'member')", [], 'chk_invites_role');
      table.check("email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", [], 'chk_invites_email_format');
      table.check("expires_at > created_at", [], 'chk_invites_expires_after_created');

      // Indexes
      table.index('token_hash', 'idx_invites_token_hash');
      table.index('account_id', 'idx_invites_account_id');
      table.index('status', 'idx_invites_status');
      table.index(['account_id', 'email', 'status'], 'idx_invites_account_email_status');

      table.comment('Account-level user invitations with workspace assignments');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('invites');
};
