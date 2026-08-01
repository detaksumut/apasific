export type MembershipApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFICATION' | 'APPROVED' | 'REJECTED' | 'ACTIVE';

/**
 * Aggregate: MembershipApplication
 * Enforces the application workflow state machine.
 */
export interface MembershipApplication {
  id: string;
  applicantIdentityId: string;
  membershipTypeId: string;
  status: MembershipApplicationStatus;
  submittedAt: Date | null;
  verifiedAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
