import * as winston from 'winston';
import { IConfigurationService, ILoggerService } from '@fnd/contracts';
import { AxiomTransport } from './axiom.transport';
import { SeqTransport } from './seq.transport';
import { OpenObserveTransport } from './openobserve.transport';

/**
 * Factory function to create log transport based on LOG_PROVIDER environment variable.
 *
 * Validates credentials and returns transport instance or null if:
 * - LOG_PROVIDER is not set (console only)
 * - Credentials are missing (warning logged, console fallback)
 * - Unknown provider (warning logged, console fallback)
 *
 * @param config Configuration service for reading env vars
 * @param logger Logger service for warnings
 * @returns Winston transport instance or null
 */
export function createLogTransport(
  config: IConfigurationService,
  logger: ILoggerService
): winston.transport | null {
  const provider = config.getLogProvider();

  if (!provider) {
    // No provider configured - console only
    return null;
  }

  switch (provider.toLowerCase()) {
    case 'axiom': {
      const axiomConfig = config.getAxiomConfig();
      if (!axiomConfig.token || !axiomConfig.dataset) {
        logger.warn('LOG_PROVIDER=axiom but credentials missing. Using console only.', {
          operation: 'log-transport-factory',
          module: 'logging',
        });
        return null;
      }
      return new AxiomTransport(axiomConfig);
    }

    case 'seq': {
      const seqConfig = config.getSeqConfig();
      if (!seqConfig.url) {
        logger.warn('LOG_PROVIDER=seq but SEQ_URL missing. Using console only.', {
          operation: 'log-transport-factory',
          module: 'logging',
        });
        return null;
      }
      return new SeqTransport(seqConfig);
    }

    case 'openobserve': {
      const ooConfig = config.getOpenObserveConfig();
      if (!ooConfig.url || !ooConfig.username || !ooConfig.password) {
        logger.warn('LOG_PROVIDER=openobserve but credentials missing. Using console only.', {
          operation: 'log-transport-factory',
          module: 'logging',
        });
        return null;
      }
      return new OpenObserveTransport(ooConfig);
    }

    default:
      logger.warn(`Unknown LOG_PROVIDER: ${provider}. Using console only.`, {
        operation: 'log-transport-factory',
        module: 'logging',
        provider,
      });
      return null;
  }
}
