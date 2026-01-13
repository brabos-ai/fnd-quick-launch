import { SubscriptionStatus } from '@fnd/domain';
import { PlanResponseDto } from '../plans/PlanResponseDto';

export class SubscriptionResponseDto {
  id!: string;
  accountId!: string;
  workspaceId!: string;
  planPriceId!: string;
  plan!: PlanResponseDto;
  status!: SubscriptionStatus;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
  currentPeriodStart!: Date;
  currentPeriodEnd!: Date;
  canceledAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
