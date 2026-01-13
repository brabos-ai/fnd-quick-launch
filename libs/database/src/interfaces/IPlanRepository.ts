import { Plan, PlanPrice } from '@fnd/domain';

export interface PlanWithPrice extends Plan {
  currentPrice?: PlanPrice;
}

export interface IPlanRepository {
  findAll(): Promise<Plan[]>;
  findById(id: string): Promise<Plan | null>;
  findByCode(code: string): Promise<Plan | null>;
  findActive(): Promise<Plan[]>;
  findActiveWithCurrentPrices(): Promise<PlanWithPrice[]>;
  create(data: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plan>;
  update(id: string, data: Partial<Plan>): Promise<Plan>;
}
