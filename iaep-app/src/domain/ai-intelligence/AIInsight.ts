/**
 * Aggregate: AIInsight
 * Captures descriptive, natural-language AI intelligence outputs.
 */
export interface AIInsight {
  id: string;
  subjectId: string; // Typically Researcher ID
  insightType: string;
  confidence: number;
  explanation: string;
  generatedAt: Date;
}
