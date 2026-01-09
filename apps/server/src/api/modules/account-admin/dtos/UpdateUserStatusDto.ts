import { IsEnum } from 'class-validator';
import { EntityStatus } from '@fnd/domain';

export class UpdateUserStatusDto {
  @IsEnum(EntityStatus)
  status!: EntityStatus;
}
