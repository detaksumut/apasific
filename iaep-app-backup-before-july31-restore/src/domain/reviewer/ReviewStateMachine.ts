import { ReviewStatus, ReviewAction } from "./ReviewStatus";

const TRANSITIONS: Record<ReviewStatus, readonly ReviewStatus[]> = {
  [ReviewStatus.Pending]: [ReviewStatus.Accepted, ReviewStatus.Rejected],
  [ReviewStatus.Accepted]: [ReviewStatus.Reviewing, ReviewStatus.Completed, ReviewStatus.Rejected],
  [ReviewStatus.Reviewing]: [ReviewStatus.Completed, ReviewStatus.Rejected],
  [ReviewStatus.Completed]: [ReviewStatus.RevisionPending],
  [ReviewStatus.RevisionPending]: [ReviewStatus.Completed, ReviewStatus.Rejected],
  [ReviewStatus.Rejected]: []
};

export class ReviewStateMachine {
  static getNextState(currentState: ReviewStatus, action: ReviewAction): ReviewStatus {
    let nextState: ReviewStatus = currentState;

    switch (currentState) {
      case ReviewStatus.Pending:
        if (action === ReviewAction.Accept) nextState = ReviewStatus.Accepted;
        if (action === ReviewAction.Reject) nextState = ReviewStatus.Rejected;
        break;
      case ReviewStatus.Accepted:
        if (action === ReviewAction.StartReview) nextState = ReviewStatus.Reviewing;
        if (action === ReviewAction.SubmitReview) nextState = ReviewStatus.Completed;
        if (action === ReviewAction.Reject) nextState = ReviewStatus.Rejected;
        break;
      case ReviewStatus.Reviewing:
        if (action === ReviewAction.SubmitReview) nextState = ReviewStatus.Completed;
        if (action === ReviewAction.Reject) nextState = ReviewStatus.Rejected;
        break;
      case ReviewStatus.Completed:
        if (action === ReviewAction.ReceiveRevision) nextState = ReviewStatus.RevisionPending;
        break;
      case ReviewStatus.RevisionPending:
        if (action === ReviewAction.SubmitReview) nextState = ReviewStatus.Completed;
        if (action === ReviewAction.Reject) nextState = ReviewStatus.Rejected;
        break;
    }

    if (nextState !== currentState && !this.canTransition(currentState, nextState)) {
      throw new Error(`Invalid review transition from ${currentState} to ${nextState} with action ${action}`);
    }

    return nextState;
  }

  static canTransition(from: ReviewStatus, to: ReviewStatus): boolean {
    if (from === to) return true;
    const allowed = TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }
}
