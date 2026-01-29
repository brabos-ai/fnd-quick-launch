import { IsString, IsOptional } from 'class-validator';

export class ArchiveWorkspaceDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
