import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '../types/Database';
import {
  validateRlsPolicies,
  RlsValidationResult,
  checkTableRls,
  TableRlsStatus,
  testRlsIsolation,
  RlsIsolationTestResult,
} from './rls-validator';

/**
 * RLS Status information returned by getStatus()
 */
export interface RlsStatus {
  enabled: boolean;
  updatedAt: Date;
  updatedBy: string;
}

/**
 * RLS Manager Service
 *
 * Manages the global Row Level Security toggle for emergency situations.
 * State is stored in-memory only (no database table needed).
 *
 * When RLS is disabled:
 * - TenantContextInterceptor skips wrapping handlers with tenant context
 * - All queries return data without tenant filtering
 * - Use only for debugging/emergency situations
 *
 * When RLS is enabled (default):
 * - TenantContextInterceptor wraps authenticated requests with tenant context
 * - RLS policies filter by app.current_account_id
 * - Tenant isolation is enforced at the database level
 *
 * @remarks
 * This is an in-memory toggle. In a multi-instance deployment, each instance
 * maintains its own state. For consistent behavior across instances, consider
 * using Redis or database-backed state in production.
 */
@Injectable()
export class RlsManager {
  private enabled: boolean = true;
  private updatedAt: Date = new Date();
  private updatedBy: string = 'system';

  constructor(private readonly db: Kysely<Database>) {}

  /**
   * Check if RLS is currently enabled
   * @returns true if RLS policies should be enforced
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enable or disable RLS globally
   *
   * When enabling RLS, this method validates that all required policies exist.
   * If validation fails, it will throw an error and not enable RLS.
   *
   * @param enabled - true to enable RLS, false to disable
   * @param updatedBy - Email or identifier of the admin making the change
   * @throws Error if enabling RLS and policies are missing or invalid
   */
  async setEnabled(enabled: boolean, updatedBy: string): Promise<void> {
    // If enabling RLS, validate policies exist first
    if (enabled) {
      await this.validatePoliciesExist();
    }

    this.enabled = enabled;
    this.updatedAt = new Date();
    this.updatedBy = updatedBy;
  }

  /**
   * Get the current RLS status including when it was last updated
   * @returns RLS status information
   */
  getStatus(): RlsStatus {
    return {
      enabled: this.enabled,
      updatedAt: this.updatedAt,
      updatedBy: this.updatedBy,
    };
  }

  /**
   * Validate that all required RLS policies exist in the database
   *
   * This method checks:
   * 1. RLS is enabled on all required tables (workspaces, users, audit_logs, etc.)
   * 2. Policies exist for all required tables
   *
   * Use this before enabling RLS to ensure the database is properly configured.
   *
   * @returns Promise<RlsValidationResult> - Validation result with details
   * @throws Error if validation fails (for backward compatibility with setEnabled)
   *
   * @example
   * const result = await rlsManager.validatePoliciesExist();
   * if (!result.valid) {
   *   console.error('Policies missing:', result.missingPolicies);
   * }
   */
  async validatePoliciesExist(): Promise<RlsValidationResult> {
    const result = await validateRlsPolicies(this.db);

    if (!result.valid) {
      throw new Error(
        result.error || 'Cannot enable RLS: validation failed'
      );
    }

    return result;
  }

  /**
   * Check RLS status for a specific table
   *
   * @param tableName - Name of the table to check
   * @returns Promise<TableRlsStatus> - Table RLS status information
   *
   * @example
   * const status = await rlsManager.checkTableStatus('workspaces');
   * console.log(`RLS enabled: ${status.rlsEnabled}, Policy exists: ${status.policyExists}`);
   */
  async checkTableStatus(tableName: string): Promise<TableRlsStatus> {
    return checkTableRls(this.db, tableName);
  }

  /**
   * Test RLS isolation by querying with and without tenant context
   *
   * This is a smoke test that verifies RLS is working correctly.
   * It queries a table without context (should return 0 rows) and with context
   * (should return rows for that tenant).
   *
   * @param accountId - Account ID to test isolation with
   * @returns Promise<RlsIsolationTestResult> - Test result
   *
   * @example
   * const result = await rlsManager.testIsolation(accountId);
   * if (!result.passed) {
   *   console.error('RLS not working:', result.error);
   * }
   */
  async testIsolation(accountId: string): Promise<RlsIsolationTestResult> {
    return testRlsIsolation(this.db, accountId);
  }
}
