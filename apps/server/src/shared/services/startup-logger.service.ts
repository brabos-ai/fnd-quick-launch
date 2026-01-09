import { Injectable, Inject } from '@nestjs/common';
import { ILoggerService, IConfigurationService } from '@fnd/contracts';

/**
 * Serviço responsável por logar informações importantes durante o startup da aplicação.
 *
 * Inclui verificação de configurações críticas como super-admin, database, etc.
 */
@Injectable()
export class StartupLoggerService {
  constructor(
    @Inject('ILoggerService') private readonly logger: ILoggerService,
    @Inject('IConfigurationService') private readonly configService: IConfigurationService,
  ) {}

  /**
   * Loga o status da configuração de super-admin no startup.
   *
   * - Se SUPER_ADMIN_EMAIL está configurado: loga INFO
   * - Se não está configurado: loga WARNING
   */
  logSuperAdminStatus(): void {
    const superAdminEmail = this.configService.getSuperAdminEmail();

    if (superAdminEmail) {
      this.logger.info('Super-admin configured', {
        operation: 'startup.super_admin.configured',
        module: 'StartupLoggerService',
        email: superAdminEmail,
      });
    } else {
      this.logger.warn('No super-admin email configured. Set SUPER_ADMIN_EMAIL environment variable.', {
        operation: 'startup.super_admin.not_configured',
        module: 'StartupLoggerService',
      });
    }
  }

  /**
   * Loga informações gerais sobre o startup da aplicação.
   *
   * Pode ser expandido para incluir outras verificações importantes.
   */
  logStartupInfo(): void {
    this.logger.info('Application starting up', {
      operation: 'startup.info',
      module: 'StartupLoggerService',
      environment: process.env.NODE_ENV || 'development',
    });

    // Verificar super-admin
    this.logSuperAdminStatus();
  }
}
