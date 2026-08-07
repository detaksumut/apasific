/**
 * Aggregate: ReputationPolicy
 * Enforces versioning on the ARS formula to ensure historical calculations remain valid.
 */
export interface ReputationPolicy {
  id: string;
  version: string;
  formulaCode: string;
  identityWeight: number;
  credentialWeight: number;
  publicationWeight: number;
  impactWeight: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
