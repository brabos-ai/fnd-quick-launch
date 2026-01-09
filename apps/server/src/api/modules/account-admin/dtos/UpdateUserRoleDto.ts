import { IsEnum } from 'class-validator';
import { UserRole } from '@fnd/domain';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role!: UserRole;
}
