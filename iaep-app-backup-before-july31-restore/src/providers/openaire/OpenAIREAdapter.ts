// src/providers/openaire/OpenAIREAdapter.ts

import { DiscoveryEvidenceSnapshot } from '../../domain/external-evidence/DiscoveryEvidenceSnapshot';
import { OpenAIREMapper } from './OpenAIREMapper';

export class OpenAIREAdapter {
  /**
   * Adapts raw OpenAIRE API JSON response into a standardized DiscoveryEvidenceSnapshot.
   */
  public static adaptResponseToSnapshot(
    publicationId: string,
    openaireResponse: any,
    payloadHash: string
  ): DiscoveryEvidenceSnapshot {
    
    // Attempt to extract the primary OpenAIRE ID from the response graph
    const openaireId = openaireResponse?.response?.results?.result?.[0]?.header?.['dri:objIdentifier']?.toString() || 'PENDING';

    const status = openaireId !== 'PENDING' ? 'VERIFIED' : 'PENDING';

    return {
      id: crypto.randomUUID(),
      publicationId: publicationId,
      provider: 'OPENAIRE',
      externalIdentifier: openaireId,
      status: status,
      metadataHash: payloadHash,
      discoveredAt: new Date(),
      verifiedAt: status === 'VERIFIED' ? new Date() : undefined,
      payload: openaireResponse // Storing raw graph response for future intelligence AI reading
    };
  }
}
