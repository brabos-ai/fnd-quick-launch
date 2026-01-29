/**
 * System Account ID for audit events without a user context
 *
 * Used for events like login failures where no authenticated user exists.
 * This allows the audit worker to persist events with RLS context.
 *
 * IMPORTANT: This ID must exist in the accounts table.
 * It should be created during database seeding.
 */
export const SYSTEM_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000';
