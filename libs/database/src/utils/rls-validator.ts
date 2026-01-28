import { Kysely, sql } from 'kysely';
import { Database } from '../types';

/**
 * Result of RLS validation for a single table
 */
export interface TableRlsStatus {
  /** Table name */
  tableName: string;
  /** Whether RLS is enabled on this table */
  rlsEnabled: boolean;
  /** Whether a policy exists for this table */
  policyExists: boolean;
  /** Policy name if exists */
  policyName?: string;
}

/**
 * Validation result for all RLS tables
 */
export interface RlsValidationResult {
  /** Overall validation status */
  valid: boolean;
  /** List of tables and their RLS status */
  tables: TableRlsStatus[];
  /** List of tables missing policies */
  missingPolicies: string[];
  /** List of tables with RLS disabled */
  rlsDisabled: string[];
  /** Human-readable error message if validation failed */
  error?: string;
}

/**
 * Result of RLS isolation test
 */
export interface RlsIsolationTestResult {
  /** Whether the test passed */
  passed: boolean;
  /** Test details */
  details: {
    /** Rows returned without context (should be 0) */
    withoutContext: number;
    /** Rows returned with context */
    withContext: number;
  };
  /** Error message if test failed */
  error?: string;
}

/**
 * Tables that should have RLS policies according to F0005 plan
 */
const RLS_TABLES = [
  'workspaces',
  'users',
  'audit_logs',
  'subscriptions',
  'invites',
  'workspace_users',
] as const;

/**
 * Query PostgreSQL system catalogs to check if a table has RLS enabled
 *
 * @param db - Kysely database instance
 * @param tableName - Name of the table to check
 * @returns Promise<boolean> - true if RLS is enabled
 */
async function isRlsEnabled(
  db: Kysely<Database>,
  tableName: string,
): Promise<boolean> {
  const result = await db
    .selectFrom(sql`pg_class`.as('pg_class'))
    .select(sql<boolean>`relrowsecurity`.as('relrowsecurity'))
    .where(sql`relname`, '=', tableName)
    .where(sql`relnamespace`, '=', sql`(SELECT oid FROM pg_namespace WHERE nspname = 'public')`)
    .executeTakeFirst();

  return result?.relrowsecurity ?? false;
}

/**
 * Query pg_policies to check if a policy exists for a table
 *
 * @param db - Kysely database instance
 * @param tableName - Name of the table to check
 * @returns Promise with policy name or null
 */
async function getPolicyName(
  db: Kysely<Database>,
  tableName: string,
): Promise<string | null> {
  const policyName = `rls_${tableName}_tenant`;
  const result = await db
    .selectFrom(sql`pg_policies`.as('pg_policies'))
    .select(sql<string>`policyname`.as('policyname'))
    .where(sql`tablename`, '=', tableName)
    .where(sql`schemaname`, '=', 'public')
    .where(sql`policyname`, '=', policyName)
    .executeTakeFirst();

  return result?.policyname ?? null;
}

/**
 * Check RLS status for a specific table
 *
 * @param db - Kysely database instance
 * @param tableName - Name of the table to check
 * @returns Promise<TableRlsStatus> - Table RLS status information
 */
export async function checkTableRls(
  db: Kysely<Database>,
  tableName: string,
): Promise<TableRlsStatus> {
  const rlsEnabled = await isRlsEnabled(db, tableName);
  const policyName = await getPolicyName(db, tableName);

  return {
    tableName,
    rlsEnabled,
    policyExists: !!policyName,
    policyName: policyName ?? undefined,
  };
}

/**
 * Validate that all required RLS policies exist and are properly configured
 *
 * This function checks:
 * 1. RLS is enabled on all required tables
 * 2. Policies exist for all required tables
 *
 * @param db - Kysely database instance
 * @returns Promise<RlsValidationResult> - Validation result with details
 *
 * @example
 * const result = await validateRlsPolicies(db);
 * if (!result.valid) {
 *   console.error('RLS validation failed:', result.error);
 *   console.error('Missing policies:', result.missingPolicies);
 * }
 */
export async function validateRlsPolicies(
  db: Kysely<Database>,
): Promise<RlsValidationResult> {
  const tables: TableRlsStatus[] = [];
  const missingPolicies: string[] = [];
  const rlsDisabled: string[] = [];

  // Check each table
  for (const tableName of RLS_TABLES) {
    const status = await checkTableRls(db, tableName);
    tables.push(status);

    if (!status.policyExists) {
      missingPolicies.push(tableName);
    }
    if (!status.rlsEnabled) {
      rlsDisabled.push(tableName);
    }
  }

  const valid = missingPolicies.length === 0 && rlsDisabled.length === 0;

  let error: string | undefined;
  if (!valid) {
    const errors: string[] = [];
    if (missingPolicies.length > 0) {
      errors.push(`Missing policies: ${missingPolicies.join(', ')}`);
    }
    if (rlsDisabled.length > 0) {
      errors.push(`RLS disabled: ${rlsDisabled.join(', ')}`);
    }
    error = errors.join('. ');
  }

  return {
    valid,
    tables,
    missingPolicies,
    rlsDisabled,
    error,
  };
}

/**
 * Test RLS isolation by querying with and without tenant context
 *
 * This is a basic smoke test that verifies:
 * 1. Queries without context return no rows (isolation working)
 * 2. Queries with valid context return rows (filtering working)
 *
 * NOTE: This test uses the 'workspaces' table. If there are no workspaces
 * for the given accountId, the test will show withContext: 0 which is normal.
 *
 * @param db - Kysely database instance
 * @param accountId - Account ID to test isolation with
 * @returns Promise<RlsIsolationTestResult> - Test result
 *
 * @example
 * const result = await testRlsIsolation(db, accountId);
 * if (!result.passed) {
 *   console.error('RLS isolation test failed:', result.error);
 * }
 */
export async function testRlsIsolation(
  db: Kysely<Database>,
  accountId: string,
): Promise<RlsIsolationTestResult> {
  try {
    // Test 1: Query without context (should return 0 rows if RLS working)
    const withoutContextResult = await db.transaction().execute(async (trx) => {
      // Don't set any context - should return nothing
      const rows = await trx.selectFrom('workspaces').selectAll().execute();
      return rows.length;
    });

    // Test 2: Query with context (should return rows for this account)
    const withContextResult = await db.transaction().execute(async (trx) => {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(accountId)) {
        throw new Error('accountId must be a valid UUID');
      }

      // Set tenant context
      await sql.raw(`SET LOCAL app.current_account_id = '${accountId}'`).execute(trx);
      const rows = await trx.selectFrom('workspaces').selectAll().execute();
      return rows.length;
    });

    // RLS is working if without context returns 0
    const passed = withoutContextResult === 0;

    return {
      passed,
      details: {
        withoutContext: withoutContextResult,
        withContext: withContextResult,
      },
      error: passed
        ? undefined
        : `RLS isolation test failed: Query without context returned ${withoutContextResult} rows (expected 0)`,
    };
  } catch (error) {
    return {
      passed: false,
      details: {
        withoutContext: -1,
        withContext: -1,
      },
      error: `RLS isolation test error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
