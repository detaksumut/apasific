// src/domain/submission/SubmissionIntegrityPayload.ts
/**
 * APASIFIC Comprehensive Manuscript Submission & Integrity Types
 * Conforms to APASIFIC Master Architecture v1.0 (Locked) - Sprint 2
 */

export const CREDIT_ROLES = [
  'Conceptualization',
  'Methodology',
  'Software',
  'Validation',
  'Formal Analysis',
  'Investigation',
  'Resources',
  'Data Curation',
  'Writing - Original Draft',
  'Writing - Review & Editing',
  'Visualization',
  'Supervision',
  'Project Administration',
  'Funding Acquisition'
] as const;

export type CRediTRole = typeof CREDIT_ROLES[number];

export interface ExtensibleResearchTaxonomy {
  articleType: string;       // e.g. 'Original Research', 'Review Article', 'Short Communication'
  researchApproach: string;  // e.g. 'Quantitative', 'Qualitative', 'Mixed-Methods', 'Meta-Analysis / SLR', 'Conceptual / Theoretical', 'Legal-Normative', 'Experimental', 'Bibliometric'
  researchDesign: string;    // e.g. 'Cross-Sectional', 'Longitudinal', 'Case Study', 'Grounded Theory', 'PRISMA Review', 'Delphi', 'Doctrinal'
}

export interface AITransparencyRecord {
  used: boolean;
  tools: string[];           // e.g. ['ChatGPT', 'Claude', 'Gemini', 'Perplexity']
  purposes: string[];        // e.g. ['Language Editing', 'Literature Search', 'Drafting', 'Coding']
  affectedSections: string[];// e.g. ['Introduction', 'Methodology', 'Discussion']
  authorResponsibilityAccepted: boolean;
  customNotes?: string;
}

export type DataAvailabilityStatus = 
  | 'OPEN_REPOSITORY'         // Open in public repo / supplementary
  | 'UPON_REASONABLE_REQUEST' // Available on reasonable request to corresponding author
  | 'RESTRICTED_ETHICAL'      // Restricted due to ethics, privacy, or NDA
  | 'NOT_APPLICABLE';         // No empirical data associated

export interface DataAvailabilityRecord {
  status: DataAvailabilityStatus;
  statement: string;
  repositoryUrl?: string;
}

export type EthicsApprovalStatus = 
  | 'APPROVAL_OBTAINED'       // Ethical clearance granted
  | 'EXEMPTION_GRANTED'       // Formal ethical exemption
  | 'NOT_REQUIRED'            // Non-human / non-sensitive study
  | 'NOT_APPLICABLE';

export interface EthicsDeclarationRecord {
  status: EthicsApprovalStatus;
  committeeName?: string;
  protocolNumber?: string;
  informedConsentConfirmed?: boolean;
}

export interface FundingDeclarationRecord {
  status: 'FUNDED' | 'NO_EXTERNAL_FUNDING';
  funderName?: string;
  grantNumber?: string;
}

export interface ConflictOfInterestRecord {
  status: 'NO_CONFLICT' | 'COMPETING_INTERESTS_DECLARED';
  details?: string;
}

export interface SubmissionPledge {
  originalityConfirmed: boolean;
  noDualSubmissionConfirmed: boolean;
  coAuthorsApprovedConfirmed: boolean;
  accuracyResponsibilityAccepted: boolean;
  timestamp: string;
}

export interface StructuredAuthorSubmissionItem {
  id: string;
  isCorresponding: boolean;
  apasificAuthId?: string;
  full_name: string;
  email: string;
  affiliation: string;
  country: string;
  orcid?: string;
  orcidProvenance: 'AUTHENTICATED' | 'AUTHOR_CLAIMED';
  academic_id?: string;
  google_scholar?: string;
  sinta?: string;
  scopus?: string;
  wos?: string;
  creditRoles: CRediTRole[];
}
