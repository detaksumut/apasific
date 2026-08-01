export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'SCREENING' | 'PEER_REVIEW' | 'DECISION';

/**
 * Aggregate: ManuscriptSubmission
 * Orchestrates the submission lifecycle of a scholarly work.
 */
export interface ManuscriptSubmission {
  id: string;
  scholarlyWorkId: string;
  authorId: string; // References the ResearcherIdentity graph
  journalId: string | null;
  status: SubmissionStatus;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
