import crypto from 'crypto';
import { Credential } from '../../domain/certification-intelligence/Credential';
import { CertificationApplication } from '../../domain/certification-intelligence/CertificationApplication';

/**
 * Phase E.3: Credential Issuance Engine
 * The absolute authority on generating academic credentials.
 */
export class CredentialIssuanceEngine {
  
  /**
   * Generates a new immutable credential.
   */
  public issueCredential(application: CertificationApplication, validityMonths: number | null): Credential {
    
    if (application.status !== 'APPROVED') {
      throw new Error("Cannot issue credential for a non-approved application.");
    }

    const issuedAt = new Date();
    let expiresAt: Date | null = null;
    if (validityMonths) {
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + validityMonths);
    }

    // Generate a unique credential string (e.g., CERT-YEAR-UUID)
    const credentialNumber = `CERT-${issuedAt.getFullYear()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    // Cryptographic proof of integrity
    const hashPayload = `${credentialNumber}:${application.researcherId}:${application.programId}:${issuedAt.toISOString()}`;
    const verificationHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const credential: Credential = {
      id: crypto.randomUUID(),
      credentialNumber,
      researcherId: application.researcherId,
      programId: application.programId,
      status: 'ISSUED',
      issuedAt,
      expiresAt,
      verificationHash,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return credential;
  }
}
