// src/providers/contracts/ICitationProvider.ts

import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';

export interface CitationWorkEvidence {
  doi: string;
  citationCount: number;
  citedByUrl?: string;
  sourceProvider: string;
}

export interface ICitationProvider {
  fetchCitationCount(doi: string): Promise<ExternalEvidenceSnapshot>;
}
