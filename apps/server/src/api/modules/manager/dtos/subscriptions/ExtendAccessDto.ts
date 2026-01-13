import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';

export class ExtendAccessDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  days!: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  reason!: string;
}
