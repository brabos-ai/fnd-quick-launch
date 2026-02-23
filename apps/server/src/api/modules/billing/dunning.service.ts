import { Injectable, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';
import { ISubscriptionRepository } from '@fnd/database';
import { SuspendSubscriptionCommand } from './commands/SuspendSubscriptionCommand';

interface DunningRecord {
  failureCount: number;
  firstFailureAt: Date;
  lastFailureAt: Date;
}

@Injectable()
export class DunningService {
  private readonly failureTracker = new Map<string, DunningRecord>();
  private readonly gracePeriodDays: number;
  private readonly maxRetries: number;

  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('ILoggerService')
    private readonly logger: ILoggerService,
    @Inject('IConfigurationService')
    private readonly configService: IConfigurationService,
    private readonly commandBus: CommandBus,
  ) {
    this.gracePeriodDays = 7;
    this.maxRetries = 3;
  }

  async recordFailure(subscriptionId: string): Promise<number> {
    const existing = this.failureTracker.get(subscriptionId);
    const now = new Date();

    if (existing) {
      existing.failureCount += 1;
      existing.lastFailureAt = now;
      this.failureTracker.set(subscriptionId, existing);

      this.logger.info('Payment failure recorded', {
        operation: 'dunning.record-failure',
        subscriptionId,
        failureCount: existing.failureCount,
      });

      return existing.failureCount;
    }

    this.failureTracker.set(subscriptionId, {
      failureCount: 1,
      firstFailureAt: now,
      lastFailureAt: now,
    });

    this.logger.info('First payment failure recorded', {
      operation: 'dunning.first-failure',
      subscriptionId,
    });

    return 1;
  }

  async recordRecovery(subscriptionId: string): Promise<void> {
    this.failureTracker.delete(subscriptionId);

    this.logger.info('Payment recovered, dunning cleared', {
      operation: 'dunning.recovered',
      subscriptionId,
    });
  }

  async checkGracePeriods(): Promise<void> {
    const now = new Date();

    for (const [subscriptionId, record] of this.failureTracker.entries()) {
      const daysSinceFirstFailure = Math.floor(
        (now.getTime() - record.firstFailureAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceFirstFailure >= this.gracePeriodDays || record.failureCount >= this.maxRetries) {
        this.logger.info('Grace period expired, suspending subscription', {
          operation: 'dunning.grace-expired',
          subscriptionId,
          daysSinceFirstFailure,
          failureCount: record.failureCount,
        });

        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (subscription && subscription.status !== 'unpaid' && subscription.status !== 'canceled') {
          await this.commandBus.execute(
            new SuspendSubscriptionCommand(
              subscriptionId,
              subscription.accountId || '',
              `Grace period expired after ${daysSinceFirstFailure} days and ${record.failureCount} failures`,
            ),
          );
        }

        this.failureTracker.delete(subscriptionId);
      }
    }
  }

  getFailureRecord(subscriptionId: string): DunningRecord | undefined {
    return this.failureTracker.get(subscriptionId);
  }
}
