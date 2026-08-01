export type ReputationLevel = 'EMERGING' | 'DEVELOPING' | 'ESTABLISHED' | 'EXCELLENT' | 'DISTINGUISHED';

/**
 * Primary Aggregate: AcademicReputationProfile
 * Represents the finalized, calculable academic standing of a researcher.
 */
export interface AcademicReputationProfile {
  id: string;
  researcherId: string;
  reputationScore: number;
  reputationLevel: ReputationLevel;
  confidenceScore: number;
  status: string;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
