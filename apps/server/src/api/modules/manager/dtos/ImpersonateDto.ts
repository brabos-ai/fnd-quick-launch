import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ImpersonateDto {
  @IsString()
  @IsNotEmpty()
  targetUserId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Reason must be at least 10 characters' })
  reason!: string;
}
