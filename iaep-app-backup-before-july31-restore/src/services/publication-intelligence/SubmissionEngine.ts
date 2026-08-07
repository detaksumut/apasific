import { ManuscriptSubmission, SubmissionStatus } from '../../domain/publication-intelligence/ManuscriptSubmission';
import { ScholarlyWork, ScholarlyWorkStatus } from '../../domain/publication-intelligence/ScholarlyWork';

/**
 * Phase H.2: Submission Workflow Engine
 * Governs the strict state transitions of a scholarly object.
 */
export class SubmissionEngine {

  /**
   * Advances the submission to the next state, preventing illegal transitions.
   */
  public transitionSubmission(submission: ManuscriptSubmission, scholarlyWork: ScholarlyWork, targetState: SubmissionStatus): ManuscriptSubmission {
    
    const allowedTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
      'DRAFT': ['SUBMITTED'],
      'SUBMITTED': ['SCREENING'],
      'SCREENING': ['PEER_REVIEW', 'DECISION'], // Reject immediately during screening -> decision
      'PEER_REVIEW': ['DECISION'],
      'DECISION': []
    };

    if (!allowedTransitions[submission.status].includes(targetState)) {
      throw new Error(`Invalid Submission Transition: Cannot move from ${submission.status} to ${targetState}`);
    }

    // Sync underlying scholarly work status appropriately
    if (targetState === 'PEER_REVIEW') scholarlyWork.status = 'UNDER_REVIEW';
    if (targetState === 'SUBMITTED') scholarlyWork.status = 'SUBMITTED';

    return {
      ...submission,
      status: targetState,
      updatedAt: new Date()
    };
  }
}
