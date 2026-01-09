import * as winston from 'winston';

export interface SeqConfig {
  url: string;
  apiKey?: string;
}

interface LogInfo {
  timestamp?: string;
  level: string;
  message: string;
  [key: string]: unknown;
}

/**
 * Winston transport for Seq
 *
 * Sends logs to Seq using their HTTP ingestion API.
 * Format: Structured log with @t, @l, @m fields
 * Endpoint: {url}/api/events/raw
 * Auth: X-Seq-ApiKey header (optional)
 *
 * Errors are logged to console but never crash the app.
 */
export class SeqTransport extends winston.transports.Stream {
  private readonly endpoint: string;

  constructor(private readonly config: SeqConfig) {
    super();
    // Remove trailing slash if present
    const baseUrl = config.url.replace(/\/$/, '');
    this.endpoint = `${baseUrl}/api/events/raw`;
  }

  async log(info: LogInfo, callback: () => void): Promise<void> {
    try {
      await this.sendToSeq(info);
    } catch (error) {
      // Silent fail - don't crash app
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[SeqTransport] Failed to send log:', errorMessage);
    } finally {
      callback(); // Must call to avoid blocking
    }
  }

  private async sendToSeq(info: LogInfo): Promise<void> {
    // Extract timestamp, level, message and all other fields
    const { timestamp, level, message, ...fields } = info;

    // Seq expects specific format with @t, @l, @m
    const payload = {
      '@t': timestamp || new Date().toISOString(),
      '@l': this.mapLogLevel(level),
      '@m': message,
      ...fields, // Include all additional context
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if configured
    if (this.config.apiKey) {
      headers['X-Seq-ApiKey'] = this.config.apiKey;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Seq API responded with ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Map Winston log levels to Seq levels
   */
  private mapLogLevel(level: string): string {
    const levelMap: Record<string, string> = {
      error: 'Error',
      warn: 'Warning',
      info: 'Information',
      debug: 'Debug',
    };
    return levelMap[level] || 'Information';
  }
}
