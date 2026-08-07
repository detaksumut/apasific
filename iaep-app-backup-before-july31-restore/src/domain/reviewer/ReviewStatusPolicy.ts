import { ReviewStatus, ReviewStep, ACTIVE_REVIEW_STATUSES, TERMINAL_REVIEW_STATUSES } from "./ReviewStatus";

export class ReviewStatusPolicy {
  static resolveReviewStep(status: ReviewStatus): ReviewStep {
    switch (status) {
      case ReviewStatus.Pending:
        return ReviewStep.REQUEST;
      case ReviewStatus.Accepted:
      case ReviewStatus.Reviewing:
      case ReviewStatus.RevisionPending:
        return ReviewStep.REVIEW;
      case ReviewStatus.Completed:
        return ReviewStep.SUBMIT;
      default:
        return ReviewStep.REQUEST;
    }
  }

  static hasAcceptedReviewInvitation(status: ReviewStatus): boolean {
    return status !== ReviewStatus.Pending && status !== ReviewStatus.Rejected;
  }

  static isActive(status: ReviewStatus): boolean {
    return ACTIVE_REVIEW_STATUSES.includes(status);
  }

  static isTerminal(status: ReviewStatus): boolean {
    return TERMINAL_REVIEW_STATUSES.includes(status);
  }
}
