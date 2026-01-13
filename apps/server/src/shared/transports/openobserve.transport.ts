import * as winston from 'winston';

export interface OpenObserveConfig {
  url: string;
  org: string;
  username: string;
  password: string;
}

interface LogInfo {
  timestamp?: string;
  level: string;
  message: string;
  [key: string]: unknown;
}

/**
 * Winston transport for OpenObserve
 *
 * Sends logs to OpenObserve using their HTTP ingestion API.
 * Format: Array of JSON objects
 * Endpoint: {url}/api/{org}/default/_json
 * Auth: Basic authentication (base64 encoded username:password)
 *
 * Errors are logged to console but never crash the app.
 */
export class OpenObserveTransport extends winston.transports.Stream {
  private readonly endpoint: string;
  private readonly authHeader: string;

  constructor(private readonly config: OpenObserveConfig) {
    super();
    // Remove trailing slash if present
    const baseUrl = config.url.replace(/\/$/, '');
    this.endpoint = `${baseUrl}/api/${config.org}/default/_json`;

    // Prepare Basic Auth header
    const credentials = `${config.username}:${config.password}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    this.authHeader = `Basic ${base64Credentials}`;
  }

  async log(info: LogInfo, callback: () => void): Promise<void> {
    try {
      await this.sendToOpenObserve(info);
    } catch (error) {
      // Silent fail - don't crash app
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[OpenObserveTransport] Failed to send log:', errorMessage);
    } finally {
      callback(); // Must call to avoid blocking
    }
  }

  private async sendToOpenObserve(info: LogInfo): Promise<void> {
    // Extract timestamp and all fields
    const { timestamp, level, message, ...fields } = info;

    // OpenObserve expects array of JSON objects
    const payload = [
      {
        timestamp: timestamp || new Date().toISOString(),
        level,
        message,
        ...fields,
      },
    ];

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.authHeader,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`OpenObserve API responded with ${response.status}: ${response.statusText}`);
    }
  }
}
