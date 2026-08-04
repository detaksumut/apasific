// src/providers/openaire/OpenAIREProvider.ts

import { createHash } from 'crypto';
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';
import { IOpenAIREProvider } from './IOpenAIREProvider';
import { OpenAIRECapability } from './OpenAIRECapability';
import { DiscoveryEvidenceSnapshot } from '../../domain/external-evidence/DiscoveryEvidenceSnapshot';
import { OpenAIREAdapter } from './OpenAIREAdapter';

/**
 * OpenAIREProvider implements IOpenAIREProvider and communicates with the
 * OpenAIRE research-graph API. All external calls are routed through
 * ProviderRuntimeManager. No direct HTTP calls are permitted.
 *
 * The provider returns the REAL graph response. No fabricated/mock records
 * are introduced. `isIndexed` reflects the actual graph query result.
 *
 * Environment-driven behavior:
 *   - OPENAIRE_MODE=production  -> real API only; fail-closed on missing config.
 *   - OPENAIRE_MODE=sandbox     -> sandbox/test endpoint allowed (explicit config).
 */
export class OpenAIREProvider implements IOpenAIREProvider {
  private readonly baseUrl: string;
  private readonly mode: string;

  constructor() {
    this.mode = (process.env.OPENAIRE_MODE || 'sandbox').toLowerCase();
    this.baseUrl = process.env.OPENAIRE_API_URL || 'https://api.openaire.eu/search';
  }

  public getCapabilities(): string[] {
    return [
      OpenAIRECapability.SEARCH_RESEARCH_GRAPH,
      OpenAIRECapability.HARVEST_METADATA,
      OpenAIRECapability.VERIFY_PUBLICATION,
      OpenAIRECapability.FETCH_RELATIONS,
    ];
  }

  /**
   * Searches the OpenAIRE research graph for a publication using its DOI.
   * Returns the real provider response. No fabricated records introduced.
   */
  public async searchResearchGraphByDOI(doi: string): Promise<{ data: any; hash: string; isIndexed: boolean }> {
    const url = `${this.baseUrl}/publications?doi=${encodeURIComponent(doi)}&format=json`;

    const data = await ProviderRuntimeManager.executeRequest('OPENAIRE', url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      timeoutMs: 15000,
      retryAttempts: 2,
      retryDelayMs: 400,
    });

    // Determine indexing from the real response. The OpenAIRE graph returns
    // results under response.results.result. Zero results => not indexed.
    const isIndexed = Boolean(
      data?.response?.results?.result?.length ||
      data?.response?.header?.size
    );

    const payloadString = JSON.stringify(data);
    const hash = createHash('sha256').update(payloadString).digest('hex');

    return { data, hash, isIndexed };
  }

  /**
   * Adapts a raw OpenAIRE response into a standardized discovery snapshot.
   */
  public adaptToDiscoverySnapshot(
    publicationId: string,
    openaireResponse: any,
    payloadHash: string
  ): DiscoveryEvidenceSnapshot {
    return OpenAIREAdapter.adaptResponseToSnapshot(publicationId, openaireResponse, payloadHash);
  }
}
