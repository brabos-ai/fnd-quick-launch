import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ManualUpgradeDto {
  @IsNotEmpty()
  @IsString()
  newPlanPriceId!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  reason!: string;
}
