import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ILoggerService } from '@fnd/contracts';
import { DunningService } from '../api/modules/billing/dunning.service';

interface DunningCheckJobData {
  type: 'GRACE_PERIOD_CHECK';
  metadata?: { requestId?: string };
}

@Processor('payment-dunning')
export class PaymentDunningWorker extends WorkerHost {
  constructor(
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
    private readonly dunningService: DunningService,
  ) {
    super();
    this.logger.info('Payment dunning worker initialized', {
      operation: 'worker.payment-dunning.init',
    });
  }

  async process(job: Job<DunningCheckJobData>): Promise<void> {
    this.logger.info('Processing dunning check job', {
      operation: 'worker.payment-dunning.process',
      jobId: job.id,
      type: job.data.type,
    });

    try {
      await this.dunningService.checkGracePeriods();

      this.logger.info('Dunning check completed', {
        operation: 'worker.payment-dunning.process.success',
        jobId: job.id,
      });
    } catch (error) {
      this.logger.error(
        'Failed to process dunning check',
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'worker.payment-dunning.process.error',
          jobId: job.id,
        },
      );
      throw error;
    }
  }
}
