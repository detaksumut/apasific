/**
 * Aggregate: Prediction
 * Preserves forecasting data (e.g., Reputation forecasting)
 * Rule: Forecasting ONLY, does not alter the actual reputation score.
 */
export interface Prediction {
  id: string;
  subjectId: string;
  predictionType: string;
  forecast: Record<string, unknown>;
  confidence: number;
  modelVersion: string;
  createdAt: Date;
}
