// src/providers/datacite/DataCiteProvider.ts

import { createHash } from 'crypto';
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';
import { IDataCiteProvider } from './IDataCiteProvider';
import { DataCiteCapability } from './DataCiteCapability';

/**
 * DataCiteProvider implements IDataCiteProvider and communicates with the
 * DataCite REST API. All external calls are routed through
 * ProviderRuntimeManager. No direct HTTP calls are permitted.
 *
 * Environment-driven behavior:
 *   - DATACITE_MODE=production  -> real DataCite API only; credentials
 *                                  required; FAIL-CLOSED when missing.
 *   - DATACITE_MODE=sandbox     -> sandbox/test endpoint allowed (explicit
 *                                  development configuration).
 *
 * Production mode never fabricates or mocks a DOI. Missing credentials
 * result in a thrown error (fail-safe deny).
 */
export class DataCiteProvider implements IDataCiteProvider {
  private readonly apiUrl: string;
  private readonly prefix: string;
  private readonly apiToken: string;
  private readonly mode: string;

  constructor() {
    this.mode = (process.env.DATACITE_MODE || 'sandbox').toLowerCase();
    this.apiToken = process.env.DATACITE_API_TOKEN || '';
    this.prefix = process.env.DATACITE_PREFIX || '';

    if (this.mode === 'production') {
      this.apiUrl = process.env.DATACITE_API_URL || 'https://api.datacite.org/dois';
      // Fail-closed: production requires a configured prefix.
      if (!this.prefix) {
        throw new Error('DATACITE_PREFIX is required in production mode.');
      }
    } else {
      // Development/test: sandbox allowed through explicit configuration.
      this.apiUrl = process.env.DATACITE_API_URL || 'https://api.test.datacite.org/dois';
    }
  }

  public getCapabilities(): string[] {
    return [
      DataCiteCapability.REGISTER_DOI,
      DataCiteCapability.UPDATE_METADATA,
      DataCiteCapability.FETCH_METADATA,
    ];
  }

  /**
   * Registers a new DOI with DataCite for a research artifact.
   * All external communication flows through ProviderRuntimeManager.
   */
  public async registerArtifactDOI(payload: any): Promise<{ data: any; hash: string }> {
    this.assertCredentials();

    const data = await ProviderRuntimeManager.executeRequest('DATACITE', this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify(payload),
      timeoutMs: 30000,
      retryAttempts: 2,
      retryDelayMs: 600,
    });

    const payloadString = JSON.stringify(data);
    const hash = createHash('sha256').update(payloadString).digest('hex');

    return { data, hash };
  }

  /**
   * Updates metadata for an existing DataCite DOI.
   */
  public async updateMetadata(doi: string, payload: any): Promise<{ data: any; hash: string }> {
    this.assertCredentials();

    const url = `${this.apiUrl}/${encodeURIComponent(doi)}`;

    const data = await ProviderRuntimeManager.executeRequest('DATACITE', url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify(payload),
      timeoutMs: 30000,
      retryAttempts: 2,
      retryDelayMs: 600,
    });

    const payloadString = JSON.stringify(data);
    const hash = createHash('sha256').update(`${doi}:${payloadString}`).digest('hex');

    return { data, hash };
  }

  public getPrefix(): string {
    if (!this.prefix) {
      // In sandbox mode a prefix is required to construct valid test DOIs.
      throw new Error('DATACITE_PREFIX is not configured.');
    }
    return this.prefix;
  }

  private assertCredentials(): void {
    if (this.mode === 'production' && !this.apiToken) {
      throw new Error('DATACITE_API_TOKEN is required in production mode.');
    }
    // Sandbox also requires a token (DataCite test API is authenticated).
    if (!this.apiToken && !process.env.DATACITE_ALLOW_ANON_SANDBOX) {
      throw new Error('DATACITE_API_TOKEN is not configured.');
    }
  }
}
