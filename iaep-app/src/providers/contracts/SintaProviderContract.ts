// src/providers/contracts/SintaProviderContract.ts
import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';

export interface SintaIdentityEvidence {
  sintaId: string;
  name: string;
  affiliation: string;
  score: number;
}

export interface SintaPublicationEvidence {
  id: string;
  title: string;
  year: number;
  doi?: string;
  citationCount: number;
}

export interface ISintaProvider {
  verifyResearcherIdentity(identifier: string): Promise<ExternalEvidenceSnapshot>;
  fetchPublications(researcherId: string): Promise<ExternalEvidenceSnapshot>;
  fetchInstitution(institutionId: string): Promise<ExternalEvidenceSnapshot>;
  fetchImpactSignals(researcherId: string): Promise<ExternalEvidenceSnapshot>;
}
