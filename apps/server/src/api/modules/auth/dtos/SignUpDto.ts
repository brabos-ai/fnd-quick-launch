import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsOptional()
  workspaceName?: string;

  @IsString()
  @IsOptional()
  inviteToken?: string;
}
