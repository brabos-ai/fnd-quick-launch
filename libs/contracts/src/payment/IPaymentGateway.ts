import { SubscriptionResult, CustomerResult, CustomerData } from './types';

export interface IPaymentGateway {
  createSubscription(customerId: string, planId: string): Promise<SubscriptionResult>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  createCustomer(email: string, name: string): Promise<CustomerResult>;
  updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<CustomerResult>;
}