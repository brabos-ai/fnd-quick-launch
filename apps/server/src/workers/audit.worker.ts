import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { Kysely, Transaction } from 'kysely';
import { ILoggerService } from '@fnd/contracts';
import { Database, withTenantContext } from '@fnd/database';

/**
 * Job metadata interface for requestId tracking
 */
interface JobMetadata {
  requestId?: string;
}

/**
 * Audit job data interface
 * Note: accountId is required for RLS context
 */
interface AuditJobData {
  eventName: string;
  eventType: 'domain' | 'integration';
  occurredAt: string;
  payload: {
    aggregateId: string;
    accountId: string; // Required for RLS
    workspaceId?: string;
    userId?: string;
    [key: string]: any;
  };
  metadata?: JobMetadata;
}

/**
 * Extract requestId from job data metadata
 */
function extractRequestId(job: Job<AuditJobData>): string | undefined {
  return job.data.metadata?.requestId;
}

/**
 * Audit worker for processing audit log persistence jobs
 * Processes jobs from the 'audit' queue
 *
 * Responsibilities:
 * - Persist domain and integration events to audit_logs table
 * - Extract metadata from event payload (accountId, workspaceId, userId)
 * - Store full event payload for audit trail
 * - Execute DB operations within tenant RLS context
 */
@Processor('audit')
export class AuditWorker extends WorkerHost {
  constructor(
    @Inject('DATABASE')
    private readonly db: Kysely<Database>,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
  ) {
    super();
    this.logger.info('Audit worker initialized', {
      operation: 'worker.audit.init',
    });
  }

  /**
   * Process audit job
   * Called by BullMQ for each job in the queue
   */
  async process(job: Job<AuditJobData>): Promise<void> {
    const { eventName, eventType, payload } = job.data;
    const requestId = extractRequestId(job);
    const accountId = payload.accountId;

    // Validate accountId is present (required for RLS)
    if (!accountId) {
      const error = new Error('accountId is required in job payload for RLS context');
      this.logger.error(
        'Audit job missing accountId',
        error,
        {
          operation: 'worker.audit.process.validation-error',
          jobId: job.id,
          eventName,
          eventType,
          requestId,
        }
      );
      throw error;
    }

    this.logger.info('Processing audit job', {
      operation: 'worker.audit.process',
      jobId: job.id,
      eventName,
      eventType,
      accountId,
      requestId,
    });

    try {
      await this.persistAuditLog(job.data, requestId);

      this.logger.info('Audit job processed successfully', {
        operation: 'worker.audit.process.success',
        jobId: job.id,
        eventName,
        eventType,
        accountId,
        requestId,
      });
    } catch (error) {
      this.logger.error(
        'Failed to process audit job',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'worker.audit.process.error',
          jobId: job.id,
          eventName,
          eventType,
          accountId,
          requestId,
        }
      );
      throw error;
    }
  }

  /**
   * Persist audit log to database within tenant RLS context
   */
  private async persistAuditLog(data: AuditJobData, requestId?: string): Promise<void> {
    const { eventName, eventType, occurredAt, payload } = data;

    // Extract metadata from payload
    const accountId = payload.accountId;
    const workspaceId = payload.workspaceId || null;
    const userId = payload.userId || null;
    const now = new Date();

    // Wrap DB operation with tenant context for RLS
    await withTenantContext(this.db, accountId, async (trx: Transaction<Database>) => {
      await trx
        .insertInto('audit_logs')
        .values({
          workspace_id: workspaceId,
          account_id: accountId,
          user_id: userId,
          event_name: eventName,
          event_type: eventType,
          payload: payload,
          occurred_at: new Date(occurredAt),
          created_at: now,
        })
        .execute();
    });

    this.logger.info('Audit log persisted', {
      operation: 'worker.audit.persist',
      eventName,
      eventType,
      accountId,
      workspaceId: workspaceId || undefined,
      userId: userId || undefined,
      requestId,
    });
  }
}
