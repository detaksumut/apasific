export type ScholarlyWorkStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'PUBLISHED' | 'RETRACTED';

/**
 * Root Aggregate: ScholarlyWork
 * Represents the academic object itself, completely decoupled from reviewer identities or impact metrics.
 */
export interface ScholarlyWork {
  id: string;
  title: string;
  abstract: string | null;
  type: string;
  discipline: string | null;
  language: string;
  status: ScholarlyWorkStatus;
  createdAt: Date;
  updatedAt: Date;
}
