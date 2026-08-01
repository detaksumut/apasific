/**
 * Aggregate: ReputationCalculation
 * Stores the immutable history of reputation updates linked to specific formula versions.
 */
export interface ReputationCalculation {
  id: string;
  researcherId: string;
  formulaVersion: string;
  totalScore: number;
  calculationSnapshot: Record<string, unknown>; // Preserves exact state of weights and signals at that moment
  calculatedAt: Date;
}
