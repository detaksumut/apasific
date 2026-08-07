// src/providers/zenodo/ZenodoAdapter.ts

import { ExternalEvidenceSnapshot } from '@/domain/external-evidence/ExternalEvidenceSnapshot';

export class ZenodoAdapter {
  public static adaptResponseToSnapshot(
    publicationId: string, 
    zenodoResponse: any, 
    payloadHash: string
  ): ExternalEvidenceSnapshot & { doi?: string; externalUrl?: string } {
    
    // Zenodo returns the reserved DOI even before publishing, usually in metadata.prereserve_doi.doi 
    // or as doi after publishing.
    const doi = zenodoResponse.doi || (zenodoResponse.metadata?.prereserve_doi?.doi);
    
    return {
      id: crypto.randomUUID(),
      provider: 'ZENODO',
      providerEntityId: zenodoResponse.id?.toString(),
      evidenceType: 'PUBLICATION',
      payload: zenodoResponse,
      externalUrl: zenodoResponse.links?.html,
      doi: doi,
      payloadHash: payloadHash,
      sourceTimestamp: new Date(),
      verifiedAt: (zenodoResponse.submitted ? new Date() : undefined) as any,
    };
  }
}
