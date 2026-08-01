import { AcademicEngagement, EngagementStatus } from '../../domain/scholarly-marketplace/AcademicEngagement';
import { AcademicCompensation } from '../../domain/scholarly-marketplace/AcademicCompensation';

/**
 * Phase J.5 & J.6: Engagement Contract & Compensation Governance
 * Enforces the state machine for an academic engagement and isolates compensation tracking.
 */
export class EngagementContractService {

  /**
   * Transitions an engagement to the next state, ensuring workflow integrity.
   */
  public transitionEngagement(engagement: AcademicEngagement, targetState: EngagementStatus): AcademicEngagement {
    const allowedTransitions: Record<EngagementStatus, EngagementStatus[]> = {
      'REQUESTED': ['MATCHED'],
      'MATCHED': ['ACCEPTED'],
      'ACCEPTED': ['IN_PROGRESS'],
      'IN_PROGRESS': ['COMPLETED'],
      'COMPLETED': ['VERIFIED'],
      'VERIFIED': []
    };

    if (!allowedTransitions[engagement.status].includes(targetState)) {
      throw new Error(`Invalid Engagement Transition: Cannot move from ${engagement.status} to ${targetState}`);
    }

    const updated = { ...engagement, status: targetState, updatedAt: new Date() };

    if (targetState === 'ACCEPTED') {
      console.log(`[Marketplace Governance] Event: ENGAGEMENT_ACCEPTED emitted.`);
    }

    if (targetState === 'COMPLETED') {
      // NOTE: We do NOT update the reputation score here! 
      // We emit an event for the Reputation Signal Collector to process independently.
      console.log(`[Marketplace Governance] Event: ENGAGEMENT_COMPLETED emitted.`);
    }

    return updated;
  }

  /**
   * Authorizes the release of compensation once the engagement is COMPLETED.
   */
  public authorizeCompensation(compensation: AcademicCompensation, engagement: AcademicEngagement): void {
    if (engagement.status !== 'COMPLETED' && engagement.status !== 'VERIFIED') {
      throw new Error('Cannot authorize compensation for incomplete engagements.');
    }

    console.log(`[Compensation Governance] Compensation ${compensation.id} AUTHORIZED.`);
    // Emit 'COMPENSATION_SETTLED' event
  }
}
