// src/providers/crossref/CrossrefProvider.ts

import { createHash } from 'crypto';
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';
import { ICrossrefProvider } from './ICrossrefProvider';
import { CrossrefCapability } from './CrossrefCapability';

/**
 * CrossrefProvider implements ICrossrefProvider and communicates with the
 * Crossref API. All external calls are routed through ProviderRuntimeManager.
 *
 * Environment-driven behavior:
 *   - CROSSREF_MODE=production  -> real Crossref API only; credentials
 *                                  required; FAIL-CLOSED when missing.
 *   - CROSSREF_MODE=sandbox     -> sandbox/test endpoint allowed (explicit
 *                                  development configuration).
 *
 * Production mode never falls back to mock/fake data. Missing credentials
 * result in a thrown error (fail-safe deny).
 */
export class CrossrefProvider implements ICrossrefProvider {
  private readonly depositUrl: string;
  private readonly prefix: string;
  private readonly apiKey: string;
  private readonly mode: string;

  constructor() {
    this.mode = (process.env.CROSSREF_MODE || 'sandbox').toLowerCase();
    this.apiKey = process.env.CROSSREF_API_KEY || '';

    if (this.mode === 'production') {
      this.depositUrl = process.env.CROSSREF_DEPOSIT_URL || 'https://doi.crossref.org/servlet/deposit';
      this.prefix = process.env.CROSSREF_PREFIX || '';
      // Fail-closed: production requires a configured prefix.
      if (!this.prefix) {
        throw new Error('CROSSREF_PREFIX is required in production mode.');
      }
    } else {
      // Development/test: sandbox allowed only through explicit configuration.
      this.depositUrl = process.env.CROSSREF_DEPOSIT_URL || 'https://test.crossref.org/servlet/deposit';
      this.prefix = process.env.CROSSREF_PREFIX || '';
    }
  }

  public getCapabilities(): string[] {
    return [
      CrossrefCapability.REGISTER_PUBLISHER_DOI,
      CrossrefCapability.UPDATE_METADATA,
      CrossrefCapability.FETCH_METADATA,
    ];
  }

  /**
   * Deposits an XML payload to Crossref to register a Publisher DOI.
   * All external communication flows through ProviderRuntimeManager.
   */
  public async depositXML(xmlPayload: string, targetDoi: string): Promise<{ data: any; hash: string }> {
    this.assertCredentials();

    const body = new FormData();
    body.append('operation', 'doDirectUpload');
    body.append('login_id', process.env.CROSSREF_LOGIN_ID || '');
    body.append('login_passwd', this.apiKey);
    body.append('fname', 'deposit.xml');
    body.append(
      'file',
      new Blob([xmlPayload], { type: 'text/xml' }),
      'deposit.xml'
    );

    const data = await ProviderRuntimeManager.executeRequest('CROSSREF', this.depositUrl, {
      method: 'POST',
      headers: {
        // FormData sets its own Content-Type boundary; do not override.
      },
      body: body as any,
      timeoutMs: 30000,
      retryAttempts: 2,
      retryDelayMs: 600,
    });

    const payloadString = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = createHash('sha256').update(payloadString).digest('hex');

    return { data, hash };
  }

  /**
   * Updates metadata for an existing Crossref DOI via the metadata update queue.
   */
  public async updateMetadata(doi: string, xmlPayload: string): Promise<{ data: any; hash: string }> {
    this.assertCredentials();

    const body = new FormData();
    body.append('operation', 'doMetadataUpdate');
    body.append('login_id', process.env.CROSSREF_LOGIN_ID || '');
    body.append('login_passwd', this.apiKey);
    body.append('fname', 'metadata.xml');
    body.append(
      'file',
      new Blob([xmlPayload], { type: 'text/xml' }),
      'metadata.xml'
    );

    const data = await ProviderRuntimeManager.executeRequest('CROSSREF', this.depositUrl, {
      method: 'POST',
      headers: {},
      body: body as any,
      timeoutMs: 30000,
      retryAttempts: 2,
      retryDelayMs: 600,
    });

    const payloadString = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = createHash('sha256').update(`${doi}:${payloadString}`).digest('hex');

    return { data, hash };
  }

  public getPrefix(): string {
    if (!this.prefix) {
      throw new Error('CROSSREF_PREFIX is not configured.');
    }
    return this.prefix;
  }

  private assertCredentials(): void {
    if (this.mode === 'production') {
      if (!this.apiKey) {
        throw new Error('CROSSREF_API_KEY is required in production mode.');
      }
      if (!process.env.CROSSREF_LOGIN_ID) {
        throw new Error('CROSSREF_LOGIN_ID is required in production mode.');
      }
    } else if (!this.apiKey && !process.env.CROSSREF_LOGIN_ID) {
      // Sandbox/dev mode: allow unauthenticated test deposit only when
      // explicitly configured; otherwise fail-closed.
      if (!process.env.CROSSREF_ALLOW_ANON_SANDBOX) {
        throw new Error('CROSSREF credentials are not configured.');
      }
    }
  }
}
