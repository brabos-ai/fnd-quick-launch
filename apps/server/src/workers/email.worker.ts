import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { IEmailService, ILoggerService } from '@fnd/contracts';

/**
 * Job metadata interface for requestId tracking
 */
interface JobMetadata {
  requestId?: string;
}

/**
 * Email job data interface
 */
interface EmailJobData {
  type: 'SEND_EMAIL' | 'SEND_EMAIL_TEMPLATE';
  to: string;
  subject?: string;
  body?: string;
  templateId?: string;
  variables?: Record<string, any>;
  metadata?: JobMetadata;
}

/**
 * Extract requestId from job data metadata
 */
function extractRequestId(job: Job<EmailJobData>): string | undefined {
  return job.data.metadata?.requestId;
}

/**
 * Email worker for processing email sending jobs
 * Processes jobs from the 'email' queue
 *
 * Supported job types:
 * - SEND_EMAIL: Send plain email with subject and body
 * - SEND_EMAIL_TEMPLATE: Send email using a template with variables
 */
@Processor('email')
export class EmailWorker extends WorkerHost {
  constructor(
    @Inject('IEmailService')
    private readonly emailService: IEmailService,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
  ) {
    super();
    this.logger.info('Email worker initialized', {
      operation: 'worker.email.init',
    });
  }

  /**
   * Process email job
   * Called by BullMQ for each job in the queue
   */
  async process(job: Job<EmailJobData>): Promise<void> {
    const { type, to } = job.data;
    const requestId = extractRequestId(job);

    this.logger.info('Processing email job', {
      operation: 'worker.email.process',
      jobId: job.id,
      jobType: type,
      recipient: to,
      requestId,
    });

    try {
      if (type === 'SEND_EMAIL') {
        await this.processSendEmail(job);
      } else if (type === 'SEND_EMAIL_TEMPLATE') {
        await this.processSendEmailTemplate(job);
      } else {
        throw new Error(`Unknown email job type: ${type}`);
      }

      this.logger.info('Email job processed successfully', {
        operation: 'worker.email.process.success',
        jobId: job.id,
        jobType: type,
        recipient: to,
        requestId,
      });
    } catch (error) {
      this.logger.error(
        'Failed to process email job',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'worker.email.process.error',
          jobId: job.id,
          jobType: type,
          recipient: to,
          requestId,
        }
      );
      throw error;
    }
  }

  /**
   * Process SEND_EMAIL job type
   */
  private async processSendEmail(job: Job<EmailJobData>): Promise<void> {
    const { to, subject, body } = job.data;

    if (!subject || !body) {
      throw new Error('Subject and body are required for SEND_EMAIL job');
    }

    await this.emailService.sendEmail(to, subject, body);
  }

  /**
   * Process SEND_EMAIL_TEMPLATE job type
   */
  private async processSendEmailTemplate(job: Job<EmailJobData>): Promise<void> {
    const { to, templateId, variables } = job.data;

    if (!templateId) {
      throw new Error('Template ID is required for SEND_EMAIL_TEMPLATE job');
    }

    await this.emailService.sendEmailTemplate(to, templateId, variables || {});
  }
}
