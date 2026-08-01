export type PeerReviewRecommendation = 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';

/**
 * Aggregate: PeerReviewRecord
 * Critical double-blind enforcement boundary. Never exposes authorId.
 */
export interface PeerReviewRecord {
  id: string;
  submissionId: string;
  reviewerReference: string; // Identifies the reviewer but must remain completely hidden from the author context
  recommendation: PeerReviewRecommendation | null;
  score: number | null;
  comments: string | null;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
