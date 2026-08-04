// src/services/publication-federation/providers/ZenodoVerificationService.ts

import { IIndexVerificationProvider } from '../contracts/IIndexVerificationProvider';
import { FederationResult } from '../models/FederationResult';
import { ProviderRuntimeManager } from '../../../providers/core/ProviderRuntimeManager';

/**
 * ZenodoVerificationService implements IIndexVerificationProvider and
 * verifies whether a Zenodo record is indexed/discoverable.
 *
 * All external HTTP communication is routed through ProviderRuntimeManager
 * (GAP-07 closed). No direct fetch() calls.
 */
export class ZenodoVerificationService implements IIndexVerificationProvider {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    const environment = process.env.ZENODO_ENVIRONMENT || 'sandbox';
    this.apiUrl = environment === 'production'
      ? 'https://zenodo.org/api'
      : 'https://sandbox.zenodo.org/api';
    this.apiToken = process.env.ZENODO_API_TOKEN || process.env.NEXT_PUBLIC_ZENODO_API_TOKEN || '';
  }

  public async verify(recordId: string): Promise<FederationResult> {
    try {
      const url = `${this.apiUrl}/records/${encodeURIComponent(recordId)}`;

      const data = await ProviderRuntimeManager.executeRequest('ZENODO', url, {
        method: 'GET',
        headers: this.apiToken ? { Authorization: `Bearer ${this.apiToken}` } : {},
        timeoutMs: 15000,
        retryAttempts: 2,
        retryDelayMs: 400,
      });

      // A verified record returns a record with an id/doi.
      const hasRecord = Boolean(data?.id || data?.doi);
      return {
        provider: 'zenodo',
        identifier: recordId,
        status: hasRecord ? 'DISCOVERED' : 'PENDING',
        checkedAt: new Date().toISOString(),
      };
    } catch (e) {
      return {
        provider: 'zenodo',
        identifier: recordId,
        status: 'FAILED',
        checkedAt: new Date().toISOString(),
      };
    }
  }
}
