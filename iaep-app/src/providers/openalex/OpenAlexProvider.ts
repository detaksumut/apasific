// src/providers/openalex/OpenAlexProvider.ts

import crypto from 'crypto';
import { ICitationProvider } from '../contracts/ICitationProvider';
import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';

export class OpenAlexProvider implements ICitationProvider {
  private readonly politeEmail: string;

  constructor() {
    this.politeEmail = process.env.OPENALEX_POLITE_EMAIL || 'info@apasific.org';
  }

  /**
   * Fetches real citation metrics from OpenAlex API using DOI.
   * Conforms to ICitationProvider contract.
   */
  public async fetchCitationCount(doi: string): Promise<ExternalEvidenceSnapshot> {
    try {
      const url = `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}`;
      const data = await ProviderRuntimeManager.executeRequest('OPENALEX', url, {
        method: 'GET',
        headers: {
          'User-Agent': `APASIFIC/1.0 (mailto:${this.politeEmail})`
        },
        timeoutMs: 15000,
        retryAttempts: 2,
        retryDelayMs: 400
      });
      const citationCount = data.cited_by_count || 0;
      
      const payload = {
        doi,
        citationCount,
        openAlexId: data.id,
        citedByUrl: `https://openalex.org/works?filter=cites:${data.id}`,
        sourceProvider: 'OPENALEX'
      };

      const payloadString = JSON.stringify(payload);
      const hash = crypto.createHash('sha256').update(payloadString).digest('hex');

      return {
        id: crypto.randomUUID(),
        provider: 'OPENALEX',
        providerEntityId: data.id || `openalex_${doi}`,
        evidenceType: 'CITATION',
        payload: payload,
        payloadHash: hash,
        sourceTimestamp: new Date(),
        verifiedAt: new Date()
      };
    } catch (e) {
      // Fail-closed: never fabricate citation evidence.
      // A real API failure must propagate so no fake citation count can enter
      // the evidence trail.
      console.error(`OpenAlex citation query failed for DOI ${doi}; failing closed (no mock fallback).`, e);
      throw e;
    }
  }

  /**
   * Backward-compatibility helper for OpenAlex Intelligence Metrics.
   * Fail-closed: any error from fetchCitationCount propagates so no fabricated
   * intelligence data can be returned.
   */
  public async fetchIntelligenceByDOI(doi: string): Promise<{ data: any, hash: string, isFound: boolean }> {
    const snapshot = await this.fetchCitationCount(doi);
    return {
      data: snapshot.payload,
      hash: snapshot.payloadHash,
      isFound: true
    };
  }
}
