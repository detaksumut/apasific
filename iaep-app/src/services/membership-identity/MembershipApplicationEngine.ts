import { MembershipApplication, MembershipApplicationStatus } from '../../domain/membership-identity/MembershipApplication';
import { MembershipProfile } from '../../domain/membership-identity/MembershipProfile';

/**
 * Phase F.2: Membership Application Workflow Engine
 * Enforces strict finite state transitions for membership applications.
 * Directly mutating membership statuses outside this engine is prohibited.
 */
export class MembershipApplicationEngine {

  /**
   * Transitions an application to the next state, ensuring workflow integrity.
   */
  public transitionApplication(application: MembershipApplication, targetState: MembershipApplicationStatus): MembershipApplication {
    const allowedTransitions: Record<MembershipApplicationStatus, MembershipApplicationStatus[]> = {
      'DRAFT': ['SUBMITTED'],
      'SUBMITTED': ['VERIFICATION'],
      'VERIFICATION': ['APPROVED', 'REJECTED'],
      'APPROVED': ['ACTIVE'],
      'REJECTED': [],
      'ACTIVE': []
    };

    if (!allowedTransitions[application.status].includes(targetState)) {
      throw new Error(`Invalid Application Transition: Cannot move from ${application.status} to ${targetState}`);
    }

    const updatedApp = { ...application, status: targetState, updatedAt: new Date() };

    if (targetState === 'SUBMITTED') updatedApp.submittedAt = new Date();
    if (targetState === 'VERIFICATION') updatedApp.verifiedAt = new Date();
    if (targetState === 'APPROVED') updatedApp.approvedAt = new Date();

    return updatedApp;
  }

  /**
   * Activates the membership profile upon final application approval.
   */
  public activateMembership(application: MembershipApplication): MembershipProfile {
    if (application.status !== 'APPROVED') {
      throw new Error('Application must be APPROVED before membership can be activated.');
    }

    return {
      id: crypto.randomUUID(),
      identityId: application.applicantIdentityId,
      membershipTypeId: application.membershipTypeId,
      membershipNumber: `APA-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      status: 'ACTIVE',
      joinedAt: new Date(),
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year validity
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
