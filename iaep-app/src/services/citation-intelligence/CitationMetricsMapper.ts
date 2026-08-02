// src/services/citation-intelligence/CitationMetricsMapper.ts

import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';

export interface MappedCitationMetrics {
  doi: string;
  citationCount: number;
  openAlexId: string;
  citedByUrl?: string;
  sourceProvider: string;
}

export class CitationMetricsMapper {
  public static mapToMetrics(snapshot: ExternalEvidenceSnapshot): MappedCitationMetrics {
    const payload = snapshot.payload as any;
    return {
      doi: payload.doi || '',
      citationCount: payload.citationCount || 0,
      openAlexId: payload.openAlexId || '',
      citedByUrl: payload.citedByUrl || '',
      sourceProvider: payload.sourceProvider || 'OPENALEX'
    };
  }
}
