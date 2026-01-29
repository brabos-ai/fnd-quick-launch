import { IsString, IsNotEmpty } from 'class-validator';

export class AddUserToWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;
}
