import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(100, { message: 'Full name must be at most 100 characters' })
  fullName!: string;
}
