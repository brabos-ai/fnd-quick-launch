import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import {
  ILoggerService,
  IConfigurationService,
  IQueueService,
  IEventPublisher,
  IEmailService,
  IEmailQueueService,
  IAuthorizationService,
  IAsyncContextService,
  IMetricsService,
} from '@fnd/contracts';
import {
  IUserRepository,
  IAccountRepository,
  IWorkspaceRepository,
  IWorkspaceUserRepository,
  IAuditLogRepository,
  IPlanRepository,
  ISubscriptionRepository,
  IWebhookEventRepository,
  IInviteRepository,
  UserRepository,
  AccountRepository,
  WorkspaceRepository,
  WorkspaceUserRepository,
  AuditLogRepository,
  PlanRepository,
  SubscriptionRepository,
  WebhookEventRepository,
  SessionRepository,
  LoginAttemptRepository,
  AuthTokenRepository,
  ImpersonateSessionRepository,
  InviteRepository,
  EmailChangeRequestRepository,
  createDatabase,
  RlsManager,
} from '@fnd/database';
import { ResendEmailService } from './services/resend-email.service';
import { WinstonLoggerService } from './services/winston-logger.service';
import { EmailQueueService } from './services/email-queue.service';
import { EventBrokerService } from './services/event-broker.service';
import { ConfigurationService } from './services/configuration.service';
import { StartupLoggerService } from './services/startup-logger.service';
import { AuthorizationService } from './services/authorization.service';
import { AsyncContextService } from './services/async-context.service';
import { MetricsService } from './services/metrics.service';
import { BullMQQueueAdapter, BullMQEventPublisher } from './adapters';
import { RedisProvider } from './providers/redis.provider';

const EMAIL_SERVICE_TOKEN = 'IEmailService';
const LOGGER_SERVICE_TOKEN = 'ILoggerService';
const DATABASE_TOKEN = 'DATABASE';
const USER_REPOSITORY_TOKEN = 'IUserRepository';
const ACCOUNT_REPOSITORY_TOKEN = 'IAccountRepository';
const WORKSPACE_REPOSITORY_TOKEN = 'IWorkspaceRepository';
const WORKSPACE_USER_REPOSITORY_TOKEN = 'IWorkspaceUserRepository';
const AUDIT_LOG_REPOSITORY_TOKEN = 'IAuditLogRepository';
const PLAN_REPOSITORY_TOKEN = 'IPlanRepository';
const SUBSCRIPTION_REPOSITORY_TOKEN = 'ISubscriptionRepository';
const WEBHOOK_EVENT_REPOSITORY_TOKEN = 'IWebhookEventRepository';
const SESSION_REPOSITORY_TOKEN = 'ISessionRepository';
const LOGIN_ATTEMPT_REPOSITORY_TOKEN = 'ILoginAttemptRepository';
const AUTH_TOKEN_REPOSITORY_TOKEN = 'IAuthTokenRepository';
const IMPERSONATE_SESSION_REPOSITORY_TOKEN = 'IImpersonateSessionRepository';
const INVITE_REPOSITORY_TOKEN = 'IInviteRepository';
const EMAIL_CHANGE_REQUEST_REPOSITORY_TOKEN = 'IEmailChangeRequestRepository';
const EMAIL_QUEUE_SERVICE_TOKEN = 'IEmailQueueService';
const EVENT_BROKER_TOKEN = 'IEventBroker';
const CONFIGURATION_SERVICE_TOKEN = 'IConfigurationService';
const QUEUE_SERVICE_TOKEN = 'IQueueService';
const EVENT_PUBLISHER_TOKEN = 'IEventPublisher';
const REDIS_CONNECTION_TOKEN = 'REDIS_CONNECTION';
const AUTHORIZATION_SERVICE_TOKEN = 'IAuthorizationService';
const ASYNC_CONTEXT_SERVICE_TOKEN = 'IAsyncContextService';
const METRICS_SERVICE_TOKEN = 'IMetricsService';
const RLS_MANAGER_TOKEN = 'IRlsManager';

@Module({
  imports: [ConfigModule, CqrsModule],
  providers: [
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: ResendEmailService,
    },
    {
      provide: LOGGER_SERVICE_TOKEN,
      useClass: WinstonLoggerService,
    },
    {
      provide: DATABASE_TOKEN,
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable is required');
        }

        return createDatabase(databaseUrl);
      },
      inject: [ConfigService],
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useFactory: (db) => new UserRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: ACCOUNT_REPOSITORY_TOKEN,
      useFactory: (db) => new AccountRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: WORKSPACE_REPOSITORY_TOKEN,
      useFactory: (db) => new WorkspaceRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: WORKSPACE_USER_REPOSITORY_TOKEN,
      useFactory: (db) => new WorkspaceUserRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: AUDIT_LOG_REPOSITORY_TOKEN,
      useFactory: (db) => new AuditLogRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: PLAN_REPOSITORY_TOKEN,
      useFactory: (db) => new PlanRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: SUBSCRIPTION_REPOSITORY_TOKEN,
      useFactory: (db) => new SubscriptionRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: WEBHOOK_EVENT_REPOSITORY_TOKEN,
      useFactory: (db) => new WebhookEventRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: SESSION_REPOSITORY_TOKEN,
      useFactory: (db) => new SessionRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: LOGIN_ATTEMPT_REPOSITORY_TOKEN,
      useFactory: (db) => new LoginAttemptRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: AUTH_TOKEN_REPOSITORY_TOKEN,
      useFactory: (db) => new AuthTokenRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: IMPERSONATE_SESSION_REPOSITORY_TOKEN,
      useFactory: (db) => new ImpersonateSessionRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: INVITE_REPOSITORY_TOKEN,
      useFactory: (db) => new InviteRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: EMAIL_CHANGE_REQUEST_REPOSITORY_TOKEN,
      useFactory: (db) => new EmailChangeRequestRepository(db),
      inject: [DATABASE_TOKEN],
    },
    {
      provide: EMAIL_QUEUE_SERVICE_TOKEN,
      useClass: EmailQueueService,
    },
    {
      provide: EVENT_BROKER_TOKEN,
      useClass: EventBrokerService,
    },
    {
      provide: CONFIGURATION_SERVICE_TOKEN,
      useClass: ConfigurationService,
    },
    RedisProvider,
    {
      provide: QUEUE_SERVICE_TOKEN,
      useClass: BullMQQueueAdapter,
    },
    {
      provide: EVENT_PUBLISHER_TOKEN,
      useClass: BullMQEventPublisher,
    },
    {
      provide: AUTHORIZATION_SERVICE_TOKEN,
      useClass: AuthorizationService,
    },
    {
      provide: ASYNC_CONTEXT_SERVICE_TOKEN,
      useClass: AsyncContextService,
    },
    {
      provide: METRICS_SERVICE_TOKEN,
      useClass: MetricsService,
    },
    {
      provide: RLS_MANAGER_TOKEN,
      useFactory: (db) => new RlsManager(db),
      inject: [DATABASE_TOKEN],
    },
    StartupLoggerService,
  ],
  exports: [
    EMAIL_SERVICE_TOKEN,
    LOGGER_SERVICE_TOKEN,
    DATABASE_TOKEN,
    USER_REPOSITORY_TOKEN,
    ACCOUNT_REPOSITORY_TOKEN,
    WORKSPACE_REPOSITORY_TOKEN,
    WORKSPACE_USER_REPOSITORY_TOKEN,
    AUDIT_LOG_REPOSITORY_TOKEN,
    PLAN_REPOSITORY_TOKEN,
    SUBSCRIPTION_REPOSITORY_TOKEN,
    WEBHOOK_EVENT_REPOSITORY_TOKEN,
    SESSION_REPOSITORY_TOKEN,
    LOGIN_ATTEMPT_REPOSITORY_TOKEN,
    AUTH_TOKEN_REPOSITORY_TOKEN,
    IMPERSONATE_SESSION_REPOSITORY_TOKEN,
    INVITE_REPOSITORY_TOKEN,
    EMAIL_CHANGE_REQUEST_REPOSITORY_TOKEN,
    EMAIL_QUEUE_SERVICE_TOKEN,
    EVENT_BROKER_TOKEN,
    CONFIGURATION_SERVICE_TOKEN,
    QUEUE_SERVICE_TOKEN,
    EVENT_PUBLISHER_TOKEN,
    REDIS_CONNECTION_TOKEN,
    AUTHORIZATION_SERVICE_TOKEN,
    ASYNC_CONTEXT_SERVICE_TOKEN,
    METRICS_SERVICE_TOKEN,
    RLS_MANAGER_TOKEN,
    StartupLoggerService,
  ],
})
export class SharedModule {}
