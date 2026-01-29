import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @IsOptional()
  settings?: object;
}
