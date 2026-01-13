import { IsOptional, IsString, IsEnum } from 'class-validator';
import { EntityStatus, UserRole } from '@fnd/domain';

export class ListUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(EntityStatus)
  status?: EntityStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
