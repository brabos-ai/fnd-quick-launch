import { IsEnum, IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProvider } from '@fnd/domain';

export class LinkPriceMapping {
  @IsUUID()
  @IsNotEmpty()
  planPriceId!: string;

  @IsString()
  @IsNotEmpty()
  providerPriceId!: string;
}

export class LinkGatewayDto {
  @IsEnum(PaymentProvider)
  @IsNotEmpty()
  provider!: PaymentProvider;

  @IsString()
  @IsNotEmpty()
  providerProductId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkPriceMapping)
  providerPriceIds?: LinkPriceMapping[];
}
