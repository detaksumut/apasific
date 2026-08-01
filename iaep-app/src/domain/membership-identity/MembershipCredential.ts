/**
 * Aggregate: MembershipCredential
 * Answers "What community do you belong to?"
 * Strictly separated from the CredentialIssuanceEngine which handles academic qualifications.
 */
export interface MembershipCredential {
  id: string;
  membershipId: string;
  credentialNumber: string;
  issuedAt: Date;
  status: 'VALID' | 'REVOKED';
  createdAt: Date;
  updatedAt: Date;
}
