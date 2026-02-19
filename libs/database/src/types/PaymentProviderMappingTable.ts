import { ColumnType, Generated } from 'kysely';

export interface PaymentProviderMappingTable {
  id: Generated<string>;
  entity_type: string;
  entity_id: string;
  provider: string;
  provider_id: string;
  is_active: boolean;
  metadata: ColumnType<Record<string, unknown> | null, string | null, string | null>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}
