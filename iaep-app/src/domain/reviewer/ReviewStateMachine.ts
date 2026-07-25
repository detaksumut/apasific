import { ReviewStatus } from "./ReviewStatus";

export class ReviewStateMachine {
  static getNextState(
    currentState: ReviewStatus,
    action: 'accept' | 'reject' | 'submit_review' | 'receive_revision'
  ): ReviewStatus {
    switch (currentState) {
      case ReviewStatus.Pending:
        if (action === 'accept') return ReviewStatus.Accepted;
        if (action === 'reject') return ReviewStatus.Rejected;
        break;
      case ReviewStatus.Accepted:
        if (action === 'submit_review') return ReviewStatus.Completed;
        if (action === 'reject') return ReviewStatus.Rejected;
        break;
      case ReviewStatus.Completed:
        if (action === 'receive_revision') return ReviewStatus.RevisionPending;
        break;
      case ReviewStatus.RevisionPending:
        if (action === 'submit_review') return ReviewStatus.Completed;
        if (action === 'reject') return ReviewStatus.Rejected;
        break;
    }
    return currentState;
  }

  static canAccept(currentState: ReviewStatus): boolean {
    return currentState === ReviewStatus.Pending;
  }

  static canReject(currentState: ReviewStatus): boolean {
    return [ReviewStatus.Pending, ReviewStatus.Accepted, ReviewStatus.RevisionPending].includes(currentState);
  }

  static canSubmitReview(currentState: ReviewStatus): boolean {
    return [ReviewStatus.Accepted, ReviewStatus.RevisionPending].includes(currentState);
  }
}
