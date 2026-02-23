/**
 * Migration: Create payment_provider_mappings table
 * Polymorphic mapping table that stores external gateway IDs for domain entities,
 * replacing stripe_* columns across accounts, subscriptions, plans and plan_prices.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('payment_provider_mappings', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('entity_type', 50).notNullable();
      table.uuid('entity_id').notNullable();
      table.string('provider', 50).notNullable();
      table.string('provider_id', 255).notNullable();
      table.boolean('is_active').notNullable().defaultTo(true);
      table.jsonb('metadata').nullable();
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

      // Constraints
      table.unique(['entity_type', 'entity_id', 'provider'], { indexName: 'uq_ppm_entity_type_entity_id_provider' });
      table.check(
        "entity_type IN ('account', 'workspace', 'plan', 'plan_price', 'subscription')",
        [],
        'chk_ppm_entity_type'
      );

      // Indexes
      table.index(['provider', 'provider_id'], 'idx_ppm_provider_provider_id');
      table.index(['entity_type', 'entity_id'], 'idx_ppm_entity');

      table.comment('Polymorphic mapping of domain entities to external payment gateway IDs');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('payment_provider_mappings');
};
