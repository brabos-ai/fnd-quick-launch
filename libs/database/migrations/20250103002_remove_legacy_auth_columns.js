/**
 * Migration: Remove legacy authentication columns
 *
 * Removes columns that are no longer used after migrating to Supabase Auth:
 * - password_hash (auth now handled by Supabase)
 * - email_verified (managed by Supabase Auth)
 * - email_verification_token (managed by Supabase Auth)
 * - email_verification_token_expiry (managed by Supabase Auth)
 *
 * WARNING: This migration is destructive. Ensure all users have been migrated
 * to Supabase Auth before running this migration.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('password_hash');
    table.dropColumn('email_verified');
    table.dropColumn('email_verification_token');
    table.dropColumn('email_verification_token_expiry');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('password_hash', 255).notNullable().defaultTo('');
    table.boolean('email_verified').notNullable().defaultTo(false);
    table.string('email_verification_token', 255).nullable();
    table.timestamp('email_verification_token_expiry').nullable();
  });
};
