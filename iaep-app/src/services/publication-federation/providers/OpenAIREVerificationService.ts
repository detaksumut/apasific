// src/services/publication-federation/providers/OpenAIREVerificationService.ts

import { IIndexVerificationProvider } from '../contracts/IIndexVerificationProvider';
import { FederationResult } from '../models/FederationResult';
import { ProviderRuntimeManager } from '../../../providers/core/ProviderRuntimeManager';

/**
 * OpenAIREVerificationService implements IIndexVerificationProvider and
 * verifies whether a publication (by DOI) is discoverable in the OpenAIRE
 * research graph.
 *
 * All external HTTP communication is routed through ProviderRuntimeManager
 * (GAP-07 closed). No direct fetch() calls.
 */
export class OpenAIREVerificationService implements IIndexVerificationProvider {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.OPENAIRE_API_URL || 'https://api.openaire.eu/search/publications';
  }

  public async verify(doi: string): Promise<FederationResult> {
    try {
      const url = `${this.baseUrl}?doi=${encodeURIComponent(doi)}&format=json`;

      const json = await ProviderRuntimeManager.executeRequest('OPENAIRE', url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeoutMs: 15000,
        retryAttempts: 2,
        retryDelayMs: 400,
      });

      const total = json?.response?.header?.size?.['$'] || json?.response?.header?.size || 0;

      if (Number(total) > 0) {
        return {
          provider: 'openaire',
          identifier: doi,
          status: 'DISCOVERED',
          checkedAt: new Date().toISOString(),
        };
      }

      return {
        provider: 'openaire',
        identifier: doi,
        status: 'PENDING',
        checkedAt: new Date().toISOString(),
      };
    } catch (e) {
      return {
        provider: 'openaire',
        identifier: doi,
        status: 'FAILED',
        checkedAt: new Date().toISOString(),
      };
    }
  }
}
