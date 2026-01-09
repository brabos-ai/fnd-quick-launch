import { Controller, Get, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { IMetricsService } from '@fnd/contracts';

/**
 * Metrics controller for exposing Prometheus-compatible metrics.
 * Endpoint is public (no JWT) to allow APM scraping.
 */
@Controller('metrics')
export class MetricsController {
  constructor(
    @Inject('IMetricsService')
    private readonly metricsService: IMetricsService
  ) {}

  /**
   * GET /metrics
   * Returns metrics in Prometheus text format.
   * Public endpoint - no authentication required.
   */
  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    const metrics = await this.metricsService.getMetrics();
    const contentType = this.metricsService.getContentType();

    res.set('Content-Type', contentType);
    res.send(metrics);
  }
}
