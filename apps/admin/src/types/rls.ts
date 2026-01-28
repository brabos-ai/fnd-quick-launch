// RLS (Row Level Security) types
// Mirror backend DTOs from manager module

export interface RlsStatus {
  enabled: boolean
  updatedAt: string
  updatedBy: string
}
