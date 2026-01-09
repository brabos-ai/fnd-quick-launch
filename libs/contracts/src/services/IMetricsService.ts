/**
 * Interface for metrics service that provides Prometheus-compatible metrics.
 */
export interface IMetricsService {
  /**
   * Records the duration of an HTTP request.
   */
  recordHttpRequest(params: HttpRequestMetric): void;

  /**
   * Increments the total HTTP requests counter.
   */
  incrementHttpRequestTotal(params: HttpRequestLabel): void;

  /**
   * Gets all metrics in Prometheus text format.
   */
  getMetrics(): Promise<string>;

  /**
   * Gets the content type for Prometheus metrics.
   */
  getContentType(): string;
}

/**
 * Labels for HTTP request metrics.
 */
export interface HttpRequestLabel {
  method: string;
  path: string;
  status: number;
}

/**
 * Metric data for HTTP request duration.
 */
export interface HttpRequestMetric extends HttpRequestLabel {
  duration: number;
}
