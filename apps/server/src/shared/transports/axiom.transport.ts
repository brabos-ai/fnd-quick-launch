import * as winston from 'winston';

export interface AxiomConfig {
  token: string;
  dataset: string;
}

interface LogInfo {
  timestamp?: string;
  level: string;
  message: string;
  [key: string]: unknown;
}

/**
 * Winston transport for Axiom.co
 *
 * Sends logs to Axiom using their HTTP ingestion API.
 * Format: Array of objects with _time field (ISO8601)
 * Endpoint: https://api.axiom.co/v1/datasets/{dataset}/ingest
 * Auth: x-axiom-token header
 *
 * Errors are logged to console but never crash the app.
 */
export class AxiomTransport extends winston.transports.Stream {
  private readonly endpoint: string;

  constructor(private readonly config: AxiomConfig) {
    super();
    this.endpoint = `https://api.axiom.co/v1/datasets/${config.dataset}/ingest`;
  }

  async log(info: LogInfo, callback: () => void): Promise<void> {
    try {
      await this.sendToAxiom(info);
    } catch (error) {
      // Silent fail - don't crash app
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[AxiomTransport] Failed to send log:', errorMessage);
    } finally {
      callback(); // Must call to avoid blocking
    }
  }

  private async sendToAxiom(info: LogInfo): Promise<void> {
    // Extract timestamp and all fields
    const { timestamp, level, message, ...fields } = info;

    // Axiom expects array of objects with _time field
    const payload = [
      {
        _time: timestamp || new Date().toISOString(),
        level,
        message,
        ...fields,
      },
    ];

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-axiom-token': this.config.token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Axiom API responded with ${response.status}: ${response.statusText}`);
    }
  }
}
