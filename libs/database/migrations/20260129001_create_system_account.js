/**
 * MIGRATION - Create System Account
 * Creates a special "system" account for audit events without user context.
 * Used for login failures and other unauthenticated events.
 *
 * The UUID is hardcoded to match SYSTEM_ACCOUNT_ID constant in @fnd/domain.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Check if system account already exists
  const existing = await knex('accounts')
    .where('id', '00000000-0000-0000-0000-000000000000')
    .first();

  if (!existing) {
    await knex('accounts').insert({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'System',
      settings: JSON.stringify({}),
      status: 'active',
      stripe_customer_id: null,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }
};

exports.down = async function(knex) {
  await knex('accounts')
    .where('id', '00000000-0000-0000-0000-000000000000')
    .del();
};
