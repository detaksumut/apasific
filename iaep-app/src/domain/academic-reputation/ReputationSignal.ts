/**
 * Aggregate: ReputationSignal
 * Translates cross-context evidence into mathematical components.
 */
export interface ReputationSignal {
  id: string;
  researcherId: string;
  signalType: string;
  sourceContext: string;
  rawValue: number;
  normalizedValue: number;
  weight: number;
  contributionScore: number;
  confidence: number;
  calculatedAt: Date;
}
