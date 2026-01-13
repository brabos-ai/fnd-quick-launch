export class StripePriceDto {
  id!: string;
  currency!: string;
  unitAmount!: number;
  recurring!: {
    interval: string;
    intervalCount: number;
  } | null;
  active!: boolean;
}

export class StripeProductDto {
  id!: string;
  name!: string;
  description?: string | null;
  active!: boolean;
  prices!: StripePriceDto[];
}
