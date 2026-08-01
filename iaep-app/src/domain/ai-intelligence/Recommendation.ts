export type RecommendationType = 'COLLABORATION' | 'REVIEWER' | 'EXPERT_PANEL';

/**
 * Aggregate: Recommendation
 * Stores matching outputs for expert discovery and collaboration.
 */
export interface Recommendation {
  id: string;
  requesterId: string | null;
  targetId: string;
  type: RecommendationType;
  score: number;
  explanation: string | null;
  createdAt: Date;
}
