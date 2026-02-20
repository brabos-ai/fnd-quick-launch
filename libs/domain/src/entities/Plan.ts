import { PlanFeatures } from '../types/PlanFeatures';

export interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  features: PlanFeatures;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
