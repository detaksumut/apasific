export enum ReviewStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Reviewing = 'reviewing',
  RevisionPending = 'revision_pending',
  Completed = 'completed',
  Rejected = 'rejected'
}

export const ACTIVE_REVIEW_STATUSES = [
  ReviewStatus.Accepted,
  ReviewStatus.RevisionPending
];
