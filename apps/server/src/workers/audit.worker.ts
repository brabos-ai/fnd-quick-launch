import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ILoggerService } from '@fnd/contracts';
import { IAuditLogRepository } from '@fnd/database';
import { AuditLog } from '@fnd/domain';

/**
 * Job metadata interface for requestId tracking
 */
interface JobMetadata {
  requestId?: string;
}

/**
 * Audit job data interface
 */
interface AuditJobData {
  eventName: string;
  eventType: 'domain' | 'integration';
  occurredAt: string;
  payload: {
    aggregateId: string;
    accountId?: string;
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
 */
@Processor('audit')
export class AuditWorker extends WorkerHost {
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
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
    const { eventName, eventType } = job.data;
    const requestId = extractRequestId(job);

    this.logger.info('Processing audit job', {
      operation: 'worker.audit.process',
      jobId: job.id,
      eventName,
      eventType,
      requestId,
    });

    try {
      await this.persistAuditLog(job.data, requestId);

      this.logger.info('Audit job processed successfully', {
        operation: 'worker.audit.process.success',
        jobId: job.id,
        eventName,
        eventType,
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
          requestId,
        }
      );
      throw error;
    }
  }

  /**
   * Persist audit log to database
   */
  private async persistAuditLog(data: AuditJobData, requestId?: string): Promise<void> {
    const { eventName, eventType, occurredAt, payload } = data;

    // Extract metadata from payload
    const accountId = payload.accountId || null;
    const workspaceId = payload.workspaceId || null;
    const userId = payload.userId || null;

    // Create audit log entry
    const auditLogData: Omit<AuditLog, 'id' | 'createdAt'> = {
      eventName,
      eventType,
      accountId,
      workspaceId,
      userId,
      payload,
      occurredAt: new Date(occurredAt),
    };

    await this.auditLogRepository.create(auditLogData);

    this.logger.info('Audit log persisted', {
      operation: 'worker.audit.persist',
      eventName,
      eventType,
      accountId: accountId || undefined,
      workspaceId: workspaceId || undefined,
      userId: userId || undefined,
      requestId,
    });
  }
}
