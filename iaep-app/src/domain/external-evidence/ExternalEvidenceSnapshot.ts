// src/domain/external-evidence/ExternalEvidenceSnapshot.ts

export type EvidenceProvider = 'SINTA' | 'ORCID' | 'CROSSREF' | 'OPENALEX' | 'ZENODO' | 'DATACITE';
export type EvidenceType = 'IDENTITY' | 'PUBLICATION' | 'CITATION' | 'INSTITUTION' | 'IMPACT_METRIC' | 'PUBLISHER_DOI' | 'DATASET';

export interface ExternalEvidenceSnapshot {
  id: string;
  provider: EvidenceProvider;
  providerEntityId: string; // e.g., SINTA Author ID
  apasificIdentityId?: string; // Mapped internal user ID
  evidenceType: EvidenceType;
  payloadHash: string; // SHA-256 hash of the raw payload to ensure immutability
  payload: any; // The actual raw evidence data
  verifiedAt?: Date;
  sourceTimestamp: Date;
}
