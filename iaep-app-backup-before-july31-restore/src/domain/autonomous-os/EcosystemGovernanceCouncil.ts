/**
 * Aggregate: EcosystemGovernanceCouncil
 * The governing body overseeing APASIFIC's evolution and AI rules.
 */
export interface EcosystemGovernanceCouncil {
  id: string;
  councilName: string;
  mandate: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
