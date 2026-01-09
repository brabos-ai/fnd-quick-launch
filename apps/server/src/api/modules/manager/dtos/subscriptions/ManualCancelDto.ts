import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ManualCancelDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  reason!: string;
}
