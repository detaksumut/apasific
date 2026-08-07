// src/providers/crossref/CrossrefAdapter.ts

import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';

export class CrossrefAdapter {
  /**
   * Adapts the Crossref XML deposit response to an ExternalEvidenceSnapshot.
   */
  public static adaptDepositToSnapshot(
    publicationId: string,
    crossrefDoi: string,
    depositResponse: any,
    payloadHash: string
  ): ExternalEvidenceSnapshot {
    return {
      id: crypto.randomUUID(),
      provider: 'CROSSREF',
      providerEntityId: crossrefDoi,
      apasificIdentityId: publicationId,
      evidenceType: 'PUBLISHER_DOI',
      payloadHash: payloadHash,
      payload: depositResponse, // Store the HTTP response of the deposit
      sourceTimestamp: new Date(),
      // In production, Crossref deposits are async. VerifiedAt would be set via webhook or polling.
      verifiedAt: depositResponse.status === 'success' ? new Date() : undefined
    };
  }
}
