export interface ResearcherImpactProfile {
  id: string;
  researcherId: string;
  citationCount: number;
  hIndex: number;
  i10Index: number;
  publicationCount: number;
  sourceProvider: string;
  metricConfidence: number;
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
