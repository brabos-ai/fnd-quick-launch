import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';
import { PaymentProvider } from '@fnd/domain';

export class CreatePlanPriceDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsNotEmpty()
  @IsString()
  currency!: string;

  @IsNotEmpty()
  @IsEnum(['monthly', 'yearly'])
  interval!: 'monthly' | 'yearly';

  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}
