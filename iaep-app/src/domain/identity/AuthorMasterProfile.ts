// src/domain/identity/AuthorMasterProfile.ts
/**
 * APASIFIC Author Master Profile & Identity Provenance Types
 * Conforms to APASIFIC Ecosystem Master Architecture v1.0 (Locked)
 */

export type DataProvenanceStatus = 
  | 'AUTHENTICATED'        // Verified via official OAuth (ORCID)
  | 'SYSTEM_MATCHED'       // Strong evidence match by system model
  | 'AUTHOR_CLAIMED'       // Self-declared by author, unverified
  | 'EDITORIALLY_VERIFIED' // Manually audited & verified by human editor
  | 'REVIEW_REQUIRED'      // Ambiguity / inconsistency detected
  | 'DISPUTED'             // Active ownership / authenticity dispute
  | 'REJECTED';            // Invalid claim / terminal rejection

export interface AcademicIdentifierClaim {
  value: string;
  provenance: DataProvenanceStatus;
  url?: string;
  lastVerifiedAt?: string;
  confidenceScore?: number; // 0 - 100 (for system matched)
  notes?: string;
}

export interface AuthorAffiliation {
  institution: string;
  department?: string;
  position?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface AuthorMasterProfile {
  id: string;
  apasificAuthId: string; // Immutable internal master identifier (e.g. APASIFIC-AUTH-0000128)
  userId?: string;
  authenticatedOrcid?: string; // 1-to-1 Anchor constraint
  orcidAuthenticatedAt?: string;
  preferredName: string;
  previousNames: string[];
  nameVariants: string[];
  affiliations: AuthorAffiliation[];
  academicIdentifiers: {
    orcid?: AcademicIdentifierClaim;
    scopus?: AcademicIdentifierClaim;
    wos?: AcademicIdentifierClaim;
    googleScholar?: AcademicIdentifierClaim;
    sinta?: AcademicIdentifierClaim;
    [customKey: string]: AcademicIdentifierClaim | undefined;
  };
  researchProfile?: {
    fields?: string[];
    keywords?: string[];
    methodsExpertise?: string[];
  };
  profileStatus: 'ACTIVE' | 'MERGED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}
