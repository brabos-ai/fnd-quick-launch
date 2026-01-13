/**
 * Migration: Create Email Change Requests Table
 * Creates table for tracking email change requests with 2-step verification
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('email_change_requests', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.string('new_email').notNullable();
      table.string('status').notNullable().defaultTo('pending');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('user_id', 'idx_email_change_requests_user_id');
      table.index(['user_id', 'status'], 'idx_email_change_requests_user_status');

      table.comment('Email change requests with 2-step verification flow');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('email_change_requests');
};
