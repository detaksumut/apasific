/**
 * Aggregate: ExternalIdentityLink
 * Reconciles the APASIFIC Identity with external global networks (e.g., ORCID).
 */
export interface ExternalIdentityLink {
  id: string;
  researcherId: string; // The APASIFIC Identity Owner
  externalProvider: string; // e.g., 'ORCID'
  externalId: string;
  verifiedAt: Date | null;
  createdAt: Date;
}
