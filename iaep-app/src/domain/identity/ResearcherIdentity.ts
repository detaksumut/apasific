export enum ResearcherStatus {
  ACTIVE = 'ACTIVE',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED'
}

export interface ResearcherIdentity {
  id: string;
  userId?: string; // Optional for external/guest researchers
  fullName: string;
  institution?: string;
  academicStatus: ResearcherStatus;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}
