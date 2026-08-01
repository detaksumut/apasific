// src/providers/orcid/ORCIDAdapter.ts

import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';

export class ORCIDAdapter {
  /**
   * Adapts the ORCID OAuth authorization response to an Identity Evidence Snapshot.
   */
  public static adaptAuthToIdentitySnapshot(
    apasificIdentityId: string,
    orcidId: string,
    authPayload: any,
    payloadHash: string
  ): ExternalEvidenceSnapshot {
    return {
      id: crypto.randomUUID(),
      provider: 'ORCID',
      providerEntityId: orcidId,
      apasificIdentityId: apasificIdentityId,
      evidenceType: 'IDENTITY',
      payloadHash: payloadHash,
      payload: authPayload,
      sourceTimestamp: new Date(),
      verifiedAt: new Date()
    };
  }

  /**
   * Adapts the ORCID Work Push response to a Publication Evidence Snapshot.
   */
  public static adaptWorkPushToPublicationSnapshot(
    publicationId: string,
    orcidId: string,
    pushResponse: any,
    payloadHash: string
  ): ExternalEvidenceSnapshot {
    return {
      id: crypto.randomUUID(),
      provider: 'ORCID',
      providerEntityId: orcidId, // The identity this work is attached to
      evidenceType: 'PUBLICATION',
      payloadHash: payloadHash,
      payload: pushResponse,
      sourceTimestamp: new Date(),
      verifiedAt: new Date()
    };
  }
}
