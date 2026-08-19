// src/services/asia-index/metrics/types.ts
/**
 * Core types and mathematical bounds for the ASIA Scholarly Metrics Engine.
 * 
 * Strict Compliance:
 * 1. 4-Tier state machine: INSUFFICIENT_DATA, PROVISIONAL, CALCULATED, VERIFIED.
 * 2. 4-Tier versioning: snapshot_version, metric_version, formula_version, dataset_version.
 * 3. Exact single-classification self-citations and topology confidence flags.
 */

export type MetricState = 'INSUFFICIENT_DATA' | 'PROVISIONAL' | 'CALCULATED' | 'VERIFIED';

export type SelfCitationClass = 
  | 'EXTERNAL_CITATION' 
  | 'AUTHOR_SELF_ONLY' 
  | 'JOURNAL_SELF_ONLY' 
  | 'AUTHOR_AND_JOURNAL_SELF';

export type TopologyConfidence = 'NORMAL' | 'SUSPICIOUS' | 'FLAGGED';

export interface AASCalculationInput {
  articleId: string;
  provenanceScore: number; // 0 - 100
  citations: Array<{
    sourceDoi?: string;
    sourceJournalId?: string;
    selfClass: SelfCitationClass;
    topologyConfidence: TopologyConfidence;
    sourcePrestige?: number; // 0.20 - 5.00
  }>;
  publishedDate: string | Date;
  uniqueCitingJournalsCount: number;
  hasOrcidLinked: boolean;
}

export interface AASResult {
  articleId: string;
  rawScore: number;
  score: number; // strictly bounded to [0.00, 100.00]
  components: {
    provenance: number; // strictly <= 40.00
    citation: number;   // strictly <= 35.00
    velocity: number;   // strictly <= 15.00
    network: number;    // strictly <= 10.00
  };
  continuityDecay: number; // [0.85, 1.00]
  velocityPerYear: number;
  status: MetricState;
  formulaVersion: string;
}

export interface ACSResult {
  journalId: string;
  threeYearCitationRate: number;
  citableArticlesCount: number;
  totalCitationsReceived: number;
  status: MetricState;
  formulaVersion: string;
}

export interface AIFResult {
  journalId: string;
  twoYearCitationRate: number;
  citableArticlesCount: number;
  totalCitationsReceived: number;
  status: MetricState;
  formulaVersion: string;
}

export interface ASRGraphNode {
  journalId: string;
  journalCode: string;
  subjectCategory: string;
  publishedArticlesCount: number;
}

export interface ASRGraphEdge {
  sourceJournalId: string; // KNOWN_ASIA_SOURCE only
  targetJournalId: string; // KNOWN_ASIA_SOURCE only
  selfClass: SelfCitationClass;
  topologyConfidence: TopologyConfidence;
  weight: number;
}

export interface ASRExternalInflux {
  targetJournalId: string;
  sourceType: 'VERIFIED_EXTERNAL_SOURCE' | 'UNRESOLVED_EXTERNAL_SOURCE';
  selfClass: SelfCitationClass;
  topologyConfidence: TopologyConfidence;
  count: number;
}

export interface ASRResult {
  journalId: string;
  prestigeScore: number; // Raw converged prestige
  scholarlyRank: number; // Subject-normalized ASR (1.000 = field baseline)
  subjectCategory: string;
  iterationsToConvergence: number;
  convergenceDelta: number;
  status: MetricState;
  formulaVersion: string;
}

export interface SubjectPercentileResult {
  journalId: string;
  subjectCategory: string;
  rank: number;
  totalJournalsInCategory: number;
  percentile: number | null; // e.g. 91.50 or null if N < 10
  quartile: 'AM-Q1' | 'AM-Q2' | 'AM-Q3' | 'AM-Q4' | 'N/A';
  status: MetricState;
}

export interface MetricSnapshotPayload {
  snapshotVersion: string;
  metricVersion: string;
  formulaVersion: string;
  datasetVersion: string;
  entityType: 'ARTICLE' | 'JOURNAL';
  entityId: string;
  metricName: string;
  metricValue: number;
  status: MetricState;
  formulaInputs: Record<string, any>;
  auditHash: string;
}
