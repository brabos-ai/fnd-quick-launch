import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  settings?: object;
}
