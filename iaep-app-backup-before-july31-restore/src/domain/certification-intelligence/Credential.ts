export type CredentialStatus = 'ISSUED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

/**
 * Primary Aggregate: Credential
 * Represents an immutable academic achievement. 
 */
export interface Credential {
  id: string;
  credentialNumber: string;
  researcherId: string;
  programId: string;
  status: CredentialStatus;
  issuedAt: Date;
  expiresAt: Date | null;
  verificationHash: string; // Ensures credential integrity
  createdAt: Date;
  updatedAt: Date;
}
