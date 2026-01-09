import { IFeatureFlags } from '../features/IFeatureFlags';

export interface IConfigurationService {
  getFrontendUrl(): string;
  getResendApiKey(): string;
  getResendFromEmail(): string;
  getApiPort(): number;
  getSuperAdminEmail(): string | undefined;
  isSuperAdminEmail(email: string): boolean;
  getFeatureFlags(): IFeatureFlags;

  // JWT configuration
  getJwtSecret(): string;

  // Stripe configuration
  getStripeSecretKey(): string;
  getStripeWebhookSecret(): string;
  getStripeSuccessUrl(): string;
  getStripeCancelUrl(): string;

  // Redis configuration
  getRedisUrl(): string;

  // Node mode configuration
  getNodeMode(): 'api' | 'workers' | 'hybrid';

  // Environment detection
  isTestEnvironment(): boolean;

  // Log provider configuration
  getLogProvider(): string | undefined;
  getAxiomConfig(): { token: string; dataset: string };
  getSeqConfig(): { url: string; apiKey?: string };
  getOpenObserveConfig(): { url: string; org: string; username: string; password: string };
}