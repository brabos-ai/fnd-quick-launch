import { IsString, IsUUID, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PaymentProvider } from '@fnd/domain';

export class CreateCheckoutDto {
  @IsUUID()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  planCode!: string;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;
}
