import { IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class UpdatePlanPriceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}
