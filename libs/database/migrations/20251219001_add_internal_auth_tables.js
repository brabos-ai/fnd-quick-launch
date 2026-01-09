/**
 * Migration: Add Internal Auth Tables
 * Creates tables for internal authentication system and modifies users table
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Sessions - User session tracking
    .createTable('sessions', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('refresh_token_hash').notNullable();
      table.text('ip_address').notNullable();
      table.text('user_agent').notNullable();
      table.text('device_name').nullable();
      table.timestamp('last_activity_at', { useTz: true }).notNullable();
      table.timestamp('expires_at', { useTz: true }).notNullable();
      table.timestamp('revoked_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('user_id', 'idx_sessions_user_id');
      table.index('refresh_token_hash', 'idx_sessions_refresh_token_hash');
      table.comment('User session tracking with refresh tokens');
    })

    // Login Attempts - Lockout tracking
    .createTable('login_attempts', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.text('email').notNullable();
      table.text('ip_address').notNullable();
      table.boolean('success').notNullable();
      table.timestamp('locked_until', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('email', 'idx_login_attempts_email');
      table.index('ip_address', 'idx_login_attempts_ip_address');
      table.comment('Login attempt tracking for account lockout protection');
    })

    // Auth Tokens - Password reset & email verification
    .createTable('auth_tokens', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('type').notNullable(); // 'password_reset' | 'email_verification'
      table.text('token_hash').notNullable();
      table.timestamp('expires_at', { useTz: true }).notNullable();
      table.timestamp('used_at', { useTz: true }).nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      table.index('user_id', 'idx_auth_tokens_user_id');
      table.index('type', 'idx_auth_tokens_type');
      table.index('token_hash', 'idx_auth_tokens_token_hash');
      table.comment('Tokens for password reset and email verification');
    })

    // Impersonate Sessions - Admin impersonation tracking
    .createTable('impersonate_sessions', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.uuid('admin_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('target_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.text('reason').notNullable();
      table.timestamp('expires_at', { useTz: true }).notNullable();
      table.timestamp('started_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('ended_at', { useTz: true }).nullable();

      table.index('admin_user_id', 'idx_impersonate_sessions_admin_user_id');
      table.index('target_user_id', 'idx_impersonate_sessions_target_user_id');
      table.comment('Admin impersonation session tracking for audit and security');
    })

    // Modify users table
    .alterTable('users', function(table) {
      // Add new columns
      table.text('password_hash').nullable();
      table.boolean('email_verified').notNullable().defaultTo(false);

      // Drop old column
      table.dropColumn('auth_user_id');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    // Add back auth_user_id column
    .alterTable('users', function(table) {
      table.uuid('auth_user_id').nullable();
      table.dropColumn('password_hash');
      table.dropColumn('email_verified');
    })

    // Drop new tables
    .dropTableIfExists('impersonate_sessions')
    .dropTableIfExists('auth_tokens')
    .dropTableIfExists('login_attempts')
    .dropTableIfExists('sessions');
};
