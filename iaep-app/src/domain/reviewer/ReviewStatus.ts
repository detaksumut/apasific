export enum ReviewStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Reviewing = 'reviewing',
  RevisionPending = 'revision_pending',
  Completed = 'completed',
  Rejected = 'rejected'
}

export enum ReviewStep {
  REQUEST = 1,
  GUIDELINES = 2,
  REVIEW = 3,
  SUBMIT = 4
}

export const ACTIVE_REVIEW_STATUSES = [
  ReviewStatus.Accepted,
  ReviewStatus.RevisionPending
];
