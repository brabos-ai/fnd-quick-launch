import { PlanFeatures } from '@fnd/domain';

export class PlanPriceResponseDto {
  id!: string;
  planId!: string;
  amount!: number;
  currency!: string;
  interval!: string;
  isCurrent!: boolean;
  provider?: string | null;
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
  prices!: PlanPriceResponseDto[];
  createdAt!: Date;
  updatedAt!: Date;
}
