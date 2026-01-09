import { IsNotEmpty, IsString, IsNumber, Min, MinLength } from 'class-validator';

export class GrantTrialDto {
  @IsNotEmpty()
  @IsString()
  accountId!: string;

  @IsNotEmpty()
  @IsString()
  planId!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  days!: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  reason!: string;
}
