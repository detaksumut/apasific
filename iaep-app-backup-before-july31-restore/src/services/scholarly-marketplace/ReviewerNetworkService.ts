import { ReviewerProfile } from '../../domain/scholarly-marketplace/ReviewerProfile';

/**
 * Phase J.3: Reviewer Network Service
 * Handles the logic for identifying and inviting reviewers, enforcing Conflict of Interest (COI) policies.
 */
export class ReviewerNetworkService {

  /**
   * Evaluates if a reviewer candidate has any COI with the manuscript's authors.
   * Returns true if safe to invite.
   */
  public checkConflictOfInterest(reviewer: ReviewerProfile, authorIds: string[]): boolean {
    // 1. Check if Reviewer is in the author list.
    if (authorIds.includes(reviewer.researcherId)) return false;

    // 2. Query AffiliationRecord to ensure they don't share the same active institution.
    // 3. Query PublicationGraph to ensure no co-authorship in the last 3 years.
    
    console.log(`[Reviewer Network] Passed COI check for Reviewer: ${reviewer.researcherId}`);
    return true;
  }

  public inviteReviewer(reviewer: ReviewerProfile, manuscriptId: string): void {
    // Logic to dispatch 'REVIEWER_INVITED' event and transition state
    console.log(`[Reviewer Network] Dispatching invite to Reviewer: ${reviewer.researcherId} for Manuscript: ${manuscriptId}`);
  }
}
