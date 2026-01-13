import { PlanFeatures } from '@fnd/domain';

export class PlanPriceResponseDto {
  id!: string;
  planId!: string;
  amount!: number;
  currency!: string;
  interval!: string;
  stripePriceId?: string | null;
  isCurrent!: boolean;
  provider!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class PlanResponseDto {
  id!: string;
  code!: string;
  name!: string;
  description?: string | null;
  features!: PlanFeatures;
  isActive!: boolean;
  stripeProductId?: string | null;
  prices!: PlanPriceResponseDto[];
  createdAt!: Date;
  updatedAt!: Date;
}
