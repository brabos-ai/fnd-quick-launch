/**
 * Migration: Drop stripe_* columns
 * Removes Stripe-specific columns from domain tables now that external gateway IDs
 * are stored in the polymorphic payment_provider_mappings table.
 *
 * WARNING: This migration is destructive. Ensure all stripe_* data has been migrated
 * to payment_provider_mappings before running this migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.alterTable('accounts', function(table) {
    table.dropColumn('stripe_customer_id');
  });

  await knex.schema.alterTable('subscriptions', function(table) {
    table.dropColumn('stripe_subscription_id');
    table.dropColumn('stripe_customer_id');
  });

  await knex.schema.alterTable('plans', function(table) {
    table.dropColumn('stripe_product_id');
  });

  await knex.schema.alterTable('plan_prices', function(table) {
    table.dropColumn('stripe_price_id');
  });

  // Drop stripe_invoice_id from payment_history if it exists
  const hasStripeInvoiceId = await knex.schema.hasColumn('payment_history', 'stripe_invoice_id');
  if (hasStripeInvoiceId) {
    await knex.schema.alterTable('payment_history', function(table) {
      table.dropColumn('stripe_invoice_id');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.alterTable('accounts', function(table) {
    table.string('stripe_customer_id', 255).nullable().unique();
  });

  await knex.schema.alterTable('subscriptions', function(table) {
    table.string('stripe_subscription_id', 255).unique().notNullable().defaultTo('');
    table.string('stripe_customer_id', 255).notNullable().defaultTo('');
  });

  await knex.schema.alterTable('plans', function(table) {
    table.string('stripe_product_id', 255).unique().nullable();
  });

  await knex.schema.alterTable('plan_prices', function(table) {
    table.string('stripe_price_id', 255).unique().nullable();
  });

  await knex.schema.alterTable('payment_history', function(table) {
    table.string('stripe_invoice_id', 255).unique().notNullable().defaultTo('');
  });
};
