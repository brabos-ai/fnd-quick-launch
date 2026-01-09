import { IsDateString, IsNotEmpty } from 'class-validator';

export class DateRangeQueryDto {
  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;
}
