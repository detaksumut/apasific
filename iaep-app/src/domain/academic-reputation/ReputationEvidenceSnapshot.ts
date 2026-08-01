/**
 * Aggregate: ReputationEvidenceSnapshot
 * Critical Rule: NO SCORE WITHOUT EVIDENCE.
 * This aggregate stores the hard proof backing a signal.
 */
export interface ReputationEvidenceSnapshot {
  id: string;
  calculationId: string;
  evidenceType: string;
  evidenceReference: string;
  value: Record<string, unknown>;
  capturedAt: Date;
}
