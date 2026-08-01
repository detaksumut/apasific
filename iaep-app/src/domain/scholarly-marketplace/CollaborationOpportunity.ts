export type CollaborationStatus = 'OPEN' | 'MATCHING' | 'FILLED' | 'CLOSED';

/**
 * Aggregate: CollaborationOpportunity
 * A request/need for academic partnership.
 */
export interface CollaborationOpportunity {
  id: string;
  initiatorId: string;
  researchArea: string;
  requiredExpertise: string[];
  description: string;
  status: CollaborationStatus;
  createdAt: Date;
  updatedAt: Date;
}
