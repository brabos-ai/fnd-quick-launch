import { Injectable } from '@nestjs/common';
import { IMetricsService, HttpRequestMetric, HttpRequestLabel } from '@fnd/contracts';
import { Registry, Counter, Histogram } from 'prom-client';

/**
 * Service that provides Prometheus-compatible metrics for HTTP requests.
 * Uses a custom Registry to avoid conflicts with default metrics.
 */
@Injectable()
export class MetricsService implements IMetricsService {
  private readonly registry: Registry;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestsTotal: Counter<string>;

  constructor() {
    this.registry = new Registry();

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });
  }

  recordHttpRequest(params: HttpRequestMetric): void {
    const labels = this.normalizeLabels(params);
    this.httpRequestDuration.observe(labels, params.duration);
  }

  incrementHttpRequestTotal(params: HttpRequestLabel): void {
    const labels = this.normalizeLabels(params);
    this.httpRequestsTotal.inc(labels);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }

  private normalizeLabels(params: HttpRequestLabel): Record<string, string | number> {
    return {
      method: params.method,
      path: this.normalizePath(params.path),
      status: params.status,
    };
  }

  private normalizePath(path: string): string {
    // Normalize dynamic path segments to reduce cardinality
    // e.g., /api/v1/users/123 -> /api/v1/users/:id
    return path
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:id');
  }
}
