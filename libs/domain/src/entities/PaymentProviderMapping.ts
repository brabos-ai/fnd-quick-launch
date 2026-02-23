export interface PaymentProviderMapping {
  id: string;
  entityType: string;
  entityId: string;
  provider: string;
  providerId: string;
  isActive: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
