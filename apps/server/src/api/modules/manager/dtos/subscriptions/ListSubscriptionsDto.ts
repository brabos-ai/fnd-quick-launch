import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SubscriptionStatus } from '@fnd/domain';

export class ListSubscriptionsDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  planId?: string;
}
