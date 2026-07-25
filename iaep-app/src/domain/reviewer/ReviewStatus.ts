export const ReviewStatus = {
  Pending: 'pending',
  Accepted: 'accepted',
  Reviewing: 'reviewing',
  RevisionPending: 'revision_pending',
  Completed: 'completed',
  Rejected: 'rejected'
} as const;

export type ReviewStatus = typeof ReviewStatus[keyof typeof ReviewStatus];

export const ReviewAction = {
  Accept: 'accept',
  Reject: 'reject',
  StartReview: 'start_review',
  SubmitReview: 'submit_review',
  ReceiveRevision: 'receive_revision'
} as const;

export type ReviewAction = typeof ReviewAction[keyof typeof ReviewAction];

export const ReviewStep = {
  REQUEST: 1,
  GUIDELINES: 2,
  REVIEW: 3,
  SUBMIT: 4
} as const;

export type ReviewStep = typeof ReviewStep[keyof typeof ReviewStep];

export const ACTIVE_REVIEW_STATUSES: readonly ReviewStatus[] = [
  ReviewStatus.Accepted,
  ReviewStatus.Reviewing,
  ReviewStatus.RevisionPending
];
