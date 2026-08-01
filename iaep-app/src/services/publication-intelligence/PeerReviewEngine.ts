import { PeerReviewRecord, PeerReviewRecommendation } from '../../domain/publication-intelligence/PeerReviewRecord';
import { ManuscriptSubmission } from '../../domain/publication-intelligence/ManuscriptSubmission';

/**
 * Phase H.3: Double Blind Peer Review Engine
 * A fortified boundary that prevents identity leaks between Authors and Reviewers.
 */
export class PeerReviewEngine {
  
  /**
   * Retrieves an anonymized version of the submission for the reviewer.
   * Absolutely strips out the authorId to enforce Double-Blind.
   */
  public getAnonymizedManuscript(submission: ManuscriptSubmission): Omit<ManuscriptSubmission, 'authorId'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { authorId, ...anonymizedSubmission } = submission;
    return anonymizedSubmission;
  }

  /**
   * Calculates the final peer review decision based on multiple recommendations.
   * Reviewers do not know who they are deciding on.
   */
  public evaluateDecision(reviews: PeerReviewRecord[]): PeerReviewRecommendation {
    if (reviews.length === 0) throw new Error("Cannot evaluate decision without reviews.");

    const hasReject = reviews.some(r => r.recommendation === 'REJECT');
    const hasMajor = reviews.some(r => r.recommendation === 'MAJOR_REVISION');

    if (hasReject) return 'REJECT';
    if (hasMajor) return 'MAJOR_REVISION';
    
    // Simplistic rule: If no reject/major, it's either minor or accept.
    return 'ACCEPT'; 
  }
}
