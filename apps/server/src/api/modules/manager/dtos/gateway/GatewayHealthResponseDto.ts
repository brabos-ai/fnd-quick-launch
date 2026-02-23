import { PaymentProvider } from '@fnd/domain';

export class GatewayHealthResponseDto {
  provider!: PaymentProvider;
  healthy!: boolean;
  latencyMs!: number;
  message?: string;
}
