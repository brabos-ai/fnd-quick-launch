import { IsNotEmpty, IsString } from 'class-validator';

export class LinkStripeDto {
  @IsNotEmpty()
  @IsString()
  stripeProductId!: string;
}
