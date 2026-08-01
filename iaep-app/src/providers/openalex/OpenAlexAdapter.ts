// src/providers/openalex/OpenAlexAdapter.ts

import { DiscoveryEvidenceSnapshot } from '../../domain/external-evidence/DiscoveryEvidenceSnapshot';
import { OpenAlexIntelligenceMetrics } from './OpenAlexMapper';

export class OpenAlexAdapter {
  /**
   * Adapts the OpenAlex Intelligence Metrics to the generic DiscoveryEvidenceSnapshot
   * used by the APASIFIC Evidence Layer.
   */
  public static adaptIntelligenceToSnapshot(
    publicationId: string,
    intelligence: OpenAlexIntelligenceMetrics,
    rawPayload: any,
    payloadHash: string
  ): DiscoveryEvidenceSnapshot {
    return {
      id: crypto.randomUUID(),
      publicationId: publicationId,
      provider: 'OPENALEX',
      externalIdentifier: intelligence.openAlexId,
      status: intelligence.openAlexId ? 'VERIFIED' : 'PENDING',
      metadataHash: payloadHash,
      discoveredAt: new Date(),
      verifiedAt: intelligence.openAlexId ? new Date() : undefined,
      payload: intelligence // Store the clean mapped intelligence, raw graph is too large
    };
  }
}
