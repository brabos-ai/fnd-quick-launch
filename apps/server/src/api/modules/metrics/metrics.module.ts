import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { SharedModule } from '../../../shared/shared.module';

/**
 * Module for Prometheus metrics endpoint.
 * Provides /metrics endpoint for APM scraping.
 */
@Module({
  imports: [SharedModule],
  controllers: [MetricsController],
})
export class MetricsModule {}
