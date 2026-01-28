import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleRlsDto {
  @IsBoolean()
  @IsNotEmpty()
  enabled!: boolean;
}
