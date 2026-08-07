export type MembershipStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';

/**
 * Primary Aggregate: MembershipProfile
 * Represents an individual's relationship with the APASIFIC ecosystem.
 * This is the gateway to ecosystem entitlements, separate from core Identity.
 */
export interface MembershipProfile {
  id: string;
  identityId: string; // Reference to Identity Core, not an owner
  membershipTypeId: string;
  membershipNumber: string | null;
  status: MembershipStatus;
  joinedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
