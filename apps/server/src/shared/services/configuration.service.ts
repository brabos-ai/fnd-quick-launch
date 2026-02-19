import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfigurationService, IFeatureFlags, GatewayConfig } from '@fnd/contracts';
import { PaymentProvider } from '@fnd/domain';

@Injectable()
export class ConfigurationService implements IConfigurationService {
  constructor(private readonly configService: ConfigService) {}

  getFrontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  getResendApiKey(): string {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required');
    }
    return apiKey;
  }

  getResendFromEmail(): string {
    return this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@example.com';
  }

  getApiPort(): number {
    const port = this.configService.get<string>('API_PORT');
    return port ? parseInt(port, 10) : 3001;
  }

  getSuperAdminEmail(): string | undefined {
    const email = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    return email && email.trim() !== '' ? email.trim() : undefined;
  }

  isSuperAdminEmail(email: string): boolean {
    const superAdminEmail = this.getSuperAdminEmail();
    if (!superAdminEmail) return false;
    return email.toLowerCase().trim() === superAdminEmail.toLowerCase().trim();
  }

  getFeatureFlags(): IFeatureFlags {
    const parseBoolean = (value: string | undefined, defaultValue: boolean = true): boolean => {
      if (value === undefined || value === '') return defaultValue;
      return value.toLowerCase() === 'true' || value === '1';
    };

    return {
      workspaceEnabled: parseBoolean(
        this.configService.get<string>('FEATURES_WORKSPACE_ENABLED'),
        true
      ),
      workspaceSwitchingEnabled: parseBoolean(
        this.configService.get<string>('FEATURES_WORKSPACE_SWITCHING_ENABLED'),
        true
      ),
    };
  }

  // JWT configuration
  getJwtSecret(): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required for authentication');
    }
    return secret;
  }

  // Gateway-agnostic payment configuration
  getGatewayConfig(provider: PaymentProvider): GatewayConfig {
    const prefix = provider.toUpperCase();

    const secretKey = this.configService.get<string>(`${prefix}_SECRET_KEY`);
    if (!secretKey) {
      throw new Error(`${prefix}_SECRET_KEY is required for ${provider} billing functionality`);
    }

    const webhookSecret = this.configService.get<string>(`${prefix}_WEBHOOK_SECRET`);
    if (!webhookSecret) {
      throw new Error(`${prefix}_WEBHOOK_SECRET is required for ${provider} webhook verification`);
    }

    return {
      provider,
      secretKey,
      publicKey: this.configService.get<string>(`${prefix}_PUBLIC_KEY`),
      webhookSecret,
    };
  }

  getGatewayWebhookSecret(provider: PaymentProvider): string {
    const config = this.getGatewayConfig(provider);
    return config.webhookSecret;
  }

  getCheckoutSuccessUrl(): string {
    return this.configService.get<string>('CHECKOUT_SUCCESS_URL')
      || this.configService.get<string>('STRIPE_SUCCESS_URL')
      || `${this.getFrontendUrl()}/settings/billing?success=true`;
  }

  getCheckoutCancelUrl(): string {
    return this.configService.get<string>('CHECKOUT_CANCEL_URL')
      || this.configService.get<string>('STRIPE_CANCEL_URL')
      || `${this.getFrontendUrl()}/settings/billing?canceled=true`;
  }

  getBillingScope(): 'account' | 'workspace' {
    const scope = this.configService.get<string>('BILLING_SCOPE') || 'account';
    if (scope !== 'account' && scope !== 'workspace') {
      throw new Error('BILLING_SCOPE must be one of: account, workspace');
    }
    return scope as 'account' | 'workspace';
  }

  // Redis configuration methods
  getRedisUrl(): string {
    const url = this.configService.get<string>('REDIS_URL');
    if (!url) {
      throw new Error('REDIS_URL is required for BullMQ queue functionality');
    }
    return url;
  }

  // Node mode configuration
  getNodeMode(): 'api' | 'workers' | 'hybrid' {
    const mode = this.configService.get<string>('NODE_MODE') || 'hybrid';

    if (mode !== 'api' && mode !== 'workers' && mode !== 'hybrid') {
      throw new Error('NODE_MODE must be one of: api, workers, hybrid');
    }

    return mode as 'api' | 'workers' | 'hybrid';
  }

  // Environment detection
  isTestEnvironment(): boolean {
    const nodeEnv = this.configService.get<string>('NODE_ENV') || 'development';
    return nodeEnv === 'test';
  }

  // Log provider configuration methods
  getLogProvider(): string | undefined {
    const provider = this.configService.get<string>('LOG_PROVIDER');
    return provider && provider.trim() !== '' ? provider.trim() : undefined;
  }

  getAxiomConfig(): { token: string; dataset: string } {
    return {
      token: this.configService.get<string>('AXIOM_TOKEN') || '',
      dataset: this.configService.get<string>('AXIOM_DATASET') || '',
    };
  }

  getSeqConfig(): { url: string; apiKey?: string } {
    return {
      url: this.configService.get<string>('SEQ_URL') || '',
      apiKey: this.configService.get<string>('SEQ_API_KEY'),
    };
  }

  getOpenObserveConfig(): { url: string; org: string; username: string; password: string } {
    return {
      url: this.configService.get<string>('OPENOBSERVE_URL') || '',
      org: this.configService.get<string>('OPENOBSERVE_ORG') || 'default',
      username: this.configService.get<string>('OPENOBSERVE_USERNAME') || '',
      password: this.configService.get<string>('OPENOBSERVE_PASSWORD') || '',
    };
  }
}
