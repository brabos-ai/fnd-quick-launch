import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RequestEmailChangeDto {
  @IsEmail({}, { message: 'E-mail inválido.' })
  @IsNotEmpty({ message: 'Novo e-mail é obrigatório.' })
  newEmail!: string;

  @IsString({ message: 'Senha atual deve ser uma string.' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória.' })
  currentPassword!: string;
}
