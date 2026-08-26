// src/domain/submission/SubmissionEventLedger.ts
/**
 * APASIFIC Temporal Event Ledger & Versioned Publication Metadata Types
 * Conforms to APASIFIC Ecosystem Master Architecture v1.0 (Locked)
 * Strict Historical Independence Principle: Append-Only, Immutable Events.
 */

export type SubmissionEventType =
  | 'SUBMISSION_CREATED'    // Initial author submission (Timestamp 🔒)
  | 'REVISION_REQUESTED'    // Editor requests revision with review comments
  | 'REVISION_SUBMITTED'    // Author submits revised manuscript (Cycle 1..N)
  | 'REVIEW_STARTED'        // Peer review round initiated
  | 'EDITORIAL_DECISION'    // Editorial decision recorded
  | 'ACCEPTED'              // Official manuscript acceptance (Timestamp 🔒)
  | 'PRODUCTION_STARTED'    // Copyediting, layout & proofing
  | 'PUBLISHED'             // First public release v1.0 (Timestamp 🔒)
  | 'CORRECTION_ISSUED'     // Erratum / Corrigendum / Metadata update (Superseded version)
  | 'RETRACTION_ISSUED'     // Post-publication retraction (Record preserved, watermarked)
  | 'WITHDRAWAL_EXECUTED';  // Pre-publication author withdrawal

export interface SubmissionEventRecord {
  id: string;
  submissionId: string;
  eventType: SubmissionEventType;
  eventPayload: Record<string, any>;
  actorId?: string;
  actorRole?: string;
  createdAt: string; // Append-only timestamp, immutable
}

export interface PublicationMetadataVersion {
  id: string;
  submissionId: string;
  versionNumber: string; // e.g. "1.0", "1.1"
  volume?: string;
  issue?: string;
  edition?: string;
  pageRange?: string;
  doi?: string;
  isCurrent: boolean;
  supersededAt?: string;
  changeReason?: string;
  previousPayload?: Record<string, any>;
  actorId?: string;
  createdAt: string;
}
