import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreatePortalDto {
  @IsUUID()
  @IsNotEmpty()
  workspaceId!: string;
}
