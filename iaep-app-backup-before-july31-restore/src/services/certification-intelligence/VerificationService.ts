import { Credential } from '../../domain/certification-intelligence/Credential';

export interface VerificationResult {
  status: 'VALID' | 'INVALID';
  credentialNumber?: string;
  issued?: string;
  expires?: string;
}

/**
 * Phase E.4: Verification Service
 * Public-facing engine for validating academic achievements.
 */
export class VerificationService {
  
  /**
   * Simulates a DB lookup to verify a credential based on its public ID and verification code/hash.
   */
  public verify(credentialDbLookup: (id: string) => Credential | null, credentialId: string, verificationCode: string): VerificationResult {
    
    const credential = credentialDbLookup(credentialId);
    
    if (!credential) {
      return { status: 'INVALID' };
    }

    if (credential.verificationHash !== verificationCode) {
      return { status: 'INVALID' };
    }

    if (credential.status === 'REVOKED') {
      return { status: 'INVALID' }; // Explicitly invalid if revoked
    }

    // Check expiration
    if (credential.expiresAt && credential.expiresAt < new Date()) {
      return { status: 'INVALID' };
    }

    return {
      status: 'VALID',
      credentialNumber: credential.credentialNumber,
      issued: credential.issuedAt.toISOString(),
      expires: credential.expiresAt?.toISOString()
    };
  }
}
