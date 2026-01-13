import { IsEmail, IsEnum, IsArray, ArrayMinSize, IsUUID } from 'class-validator';
import { UserRole } from '@fnd/domain';

export class CreateInviteDto {
  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  workspaceIds!: string[];
}
