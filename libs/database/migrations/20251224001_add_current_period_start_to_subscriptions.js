/**
 * Migration: Add current_period_start to Subscriptions
 * Adds missing column to track subscription period start date
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .alterTable('subscriptions', function(table) {
      table.timestamp('current_period_start', { useTz: true })
        .nullable()
        .comment('Subscription period start date');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('subscriptions', function(table) {
      table.dropColumn('current_period_start');
    });
};
