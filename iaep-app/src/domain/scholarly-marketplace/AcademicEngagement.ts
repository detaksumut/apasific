export type EngagementStatus = 'REQUESTED' | 'MATCHED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

/**
 * Aggregate: AcademicEngagement
 * The core lifecycle container for a marketplace transaction/collaboration.
 */
export interface AcademicEngagement {
  id: string;
  requesterId: string;
  providerId: string;
  engagementType: string;
  scope: string;
  status: EngagementStatus;
  createdAt: Date;
  updatedAt: Date;
}
