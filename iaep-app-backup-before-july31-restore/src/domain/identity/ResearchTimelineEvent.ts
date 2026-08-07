/**
 * Comprehensive Academic Timeline Event Registry.
 * Forms the backbone for chronological academic footprint tracking.
 */
export type ResearchEventType =
  // Identity Events
  | 'RESEARCHER_REGISTERED'
  | 'PROFILE_SYNCHRONIZED'
  // Membership Events (Phase F)
  | 'MEMBERSHIP_APPLIED'
  | 'MEMBERSHIP_VERIFIED'
  | 'MEMBERSHIP_APPROVED'
  | 'MEMBERSHIP_ACTIVATED'
  | 'MEMBERSHIP_RENEWED'
  | 'MEMBERSHIP_EXPIRED'
  | 'MEMBERSHIP_SUSPENDED'
  
  // Publication Events (Phase H)
  | 'MANUSCRIPT_CREATED'
  | 'SUBMISSION_RECEIVED'
  | 'REVIEW_STARTED'
  | 'REVIEW_COMPLETED'
  | 'ARTICLE_ACCEPTED'
  | 'ARTICLE_PUBLISHED'
  | 'DOI_REGISTERED'
  | 'INDEXING_CONFIRMED'
  
  // Certification Events (Phase E)
  | 'CERTIFICATION_APPLIED'
  | 'ASSESSMENT_STARTED'
  | 'ASSESSMENT_COMPLETED'
  | 'CERTIFICATION_APPROVED'
  | 'CREDENTIAL_ISSUED'
  | 'CREDENTIAL_RENEWED'
  | 'CREDENTIAL_REVOKED'
  | 'CERTIFICATION_COMPLETED'
  
  // Impact Events
  | 'CITATION_GROWTH_DETECTED';

/**
 * Enforces strict auditability across bounded contexts.
 */
export interface ResearcherTimelineEvent {
  eventId: string;
  eventType: ResearchEventType;
  aggregateId: string; // The ID of the triggering aggregate (e.g., Credential ID)
  researcherId: string;
  occurredAt: Date;
  sourceContext: string; // e.g., 'certification-intelligence', 'research-impact'
  eventData?: Record<string, unknown>; // Optional additional payload
}
