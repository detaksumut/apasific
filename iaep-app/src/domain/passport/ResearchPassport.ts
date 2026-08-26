// src/domain/passport/ResearchPassport.ts
/**
 * APASIFIC Digital Research Passport™ Specification
 * Conforms to APASIFIC Master Architecture v1.0 (Locked) - Sprint 5
 */

import { ATRQSTier } from '@/services/assessment/ATRQSAssessmentEngineService';

export interface ResearchPassportIdentity {
  apasificAuthId: string;
  authenticatedOrcid: string;
  correspondingAuthor: string;
  affiliation: string;
  coAuthorsCount: number;
}

export interface ResearchPassportArticle {
  articleId: string;
  passportId: string; // e.g. "APASIFIC-PASS-2026-00128"
  doi: string;
  title: string;
  journalName: string;
  volume: number;
  issue: number;
  edition: string;
  publishedAt: string;
  originalSubmittedAt: string; // Immutable timestamp
}

export interface ResearchPassportIntegrity {
  aiTransparencyStatus: 'DISCLOSED_TRANSPARENT' | 'NO_AI_USED';
  aiToolsUsed: string[];
  ethicsClearanceStatus: string;
  dataAvailabilityStatus: string;
  fundingStatus: string;
  conflictOfInterestStatus: string;
}

export interface ResearchPassportSimilarity {
  similarityContextIndex: number; // e.g. 18%
  riskSignalSummary: 'NO_HIGH_RISK_SIGNAL' | 'REVIEW_RECOMMENDED' | 'HIGH_RISK_SIGNAL_DETECTED';
  editorialReviewStatus: 'APPROVED_BY_EDITORIAL_BOARD';
}

export interface ResearchPassportATRQS {
  compositeScore: number;
  tier: ATRQSTier;
  rubricVersion: string;     // e.g. "AT-RQS-RUBRIC-v1.0"
  assessmentVersion: string; // e.g. "1.0", "1.1"
  researchApproach: string;
}

export interface ResearchPassportProvenance {
  verificationStatus: 'VALID_AUTHENTIC' | 'SUPERSEDED' | 'DISPUTED' | 'REVOKED';
  isCurrentVersion: boolean;
  versionNumber: string;     // e.g. "1.0", "1.1"
  supersededReason?: string;
  assessedAt: string;
  lastUpdated: string;
  digitalSignature: string;
}

export interface DigitalResearchPassport {
  passportId: string;
  identity: ResearchPassportIdentity;
  article: ResearchPassportArticle;
  integrity: ResearchPassportIntegrity;
  similarity: ResearchPassportSimilarity;
  atrqs: ResearchPassportATRQS;
  provenance: ResearchPassportProvenance;
}
