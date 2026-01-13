import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailChangeDto {
  @IsString({ message: 'Token deve ser uma string.' })
  @IsNotEmpty({ message: 'Token é obrigatório.' })
  token!: string;
}
