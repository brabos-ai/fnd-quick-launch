/**
 * Migration: Add auth_user_id to users table for Supabase Auth integration
 *
 * This migration:
 * 1. Adds auth_user_id column (nullable initially for safe migration)
 * 2. Creates unique index for auth_user_id
 * 3. Adds index for performance
 *
 * Note: Column is nullable initially. After all users have auth_user_id populated,
 * run migration 20250103002_remove_legacy_auth_columns.js which will:
 * - Make auth_user_id NOT NULL
 * - Remove legacy auth columns (password_hash, email_verification_token, etc.)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Add auth_user_id column (nullable initially for safe migration)
    table.uuid('auth_user_id').nullable();

    // Create unique constraint (prevents duplicate links)
    table.unique(['auth_user_id'], { indexName: 'users_auth_user_id_unique' });

    // Create index for performance (queries by auth_user_id)
    table.index('auth_user_id', 'idx_users_auth_user_id');

    // Note: Foreign key to auth.users.id is NOT created here because
    // auth.users is managed by Supabase and may not be accessible from app schema.
    // Referential integrity is enforced at application layer.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropIndex('auth_user_id', 'idx_users_auth_user_id');
    table.dropUnique(['auth_user_id'], 'users_auth_user_id_unique');
    table.dropColumn('auth_user_id');
  });
};
