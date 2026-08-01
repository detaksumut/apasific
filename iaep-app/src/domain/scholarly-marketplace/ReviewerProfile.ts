/**
 * Aggregate: ReviewerProfile
 * Specialized capability profile for the Reviewer Network.
 */
export interface ReviewerProfile {
  id: string;
  researcherId: string;
  disciplines: string[];
  reviewExperience: string | null;
  certificationStatus: string | null;
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  createdAt: Date;
  updatedAt: Date;
}
