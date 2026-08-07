export interface ResearchMetric {
  id: string;
  researcherId: string;
  metricType: string;
  value: number;
  provider: string;
  capturedAt: Date;
}
