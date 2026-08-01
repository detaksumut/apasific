// src/providers/datacite/DataCiteAdapter.ts

import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';

export class DataCiteAdapter {
  /**
   * Adapts the DataCite DOI Registration response to an ExternalEvidenceSnapshot (Dataset).
   */
  public static adaptRegistrationToSnapshot(
    publicationId: string,
    dataciteResponse: any,
    payloadHash: string
  ): ExternalEvidenceSnapshot {
    return {
      id: crypto.randomUUID(),
      provider: 'DATACITE',
      providerEntityId: dataciteResponse.data?.id || 'UNKNOWN_DOI',
      apasificIdentityId: publicationId, // Link artifact DOI back to the main Publication ID
      evidenceType: 'DATASET', // Can represent any research artifact
      payloadHash: payloadHash,
      payload: dataciteResponse,
      sourceTimestamp: new Date(),
      verifiedAt: dataciteResponse.data?.id ? new Date() : undefined
    };
  }
}
