export enum PublicationType {
  PREPRINT = 'PREPRINT',
  JOURNAL_ARTICLE = 'JOURNAL_ARTICLE',
  CONFERENCE_PAPER = 'CONFERENCE_PAPER',
  BOOK_CHAPTER = 'BOOK_CHAPTER'
}

export enum PublicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ACCEPTED = 'ACCEPTED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export enum PublicationSource {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export interface PublicationIdentifier {
  id?: string;
  publicationId?: string;
  identifierType: string; // e.g., 'REPOSITORY_ID', 'DOI'
  identifierValue: string; // e.g., '7213621'
  provider: string; // e.g., 'SSRN', 'Crossref'
  source: PublicationSource;
  identifierUrl?: string; // e.g., 'https://papers.ssrn.com/...'
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'FAILED';
  createdAt?: Date;
}

export interface PublicationAuthor {
  id?: string;
  publicationId?: string;
  userId: string;
  authorOrder: number;
  authorRole?: string;
  createdAt?: Date;
}

export interface Publication {
  id: string;
  title: string;
  abstract?: string;
  publicationType: PublicationType;
  status: PublicationStatus;
  publicationSource: PublicationSource;
  submissionId?: string;
  authors: PublicationAuthor[];
  identifiers: PublicationIdentifier[];
  createdAt: Date;
  updatedAt: Date;
}
