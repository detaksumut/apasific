// src/domain/external-evidence/DiscoveryEvidenceSnapshot.ts

export type DiscoveryProvider = 'OPENAIRE' | 'OPENALEX' | 'ORCID' | 'DATACITE' | 'CROSSREF' | 'ZENODO' | 'GOOGLE_SCHOLAR';

export type DiscoveryStatus = 'DISCOVERED' | 'VERIFIED' | 'PENDING';

export interface DiscoveryEvidenceSnapshot {
  id: string;
  publicationId: string;
  provider: DiscoveryProvider;
  externalIdentifier: string; // e.g., OpenAIRE graph ID or DOI
  status: DiscoveryStatus;
  metadataHash: string; // SHA-256 hash of the evidence payload for integrity
  discoveredAt: Date;
  verifiedAt?: Date;
  payload?: any; // The raw research graph data harvested (for UI/AI mapping)
}
