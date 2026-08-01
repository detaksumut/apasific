export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_ASSESSMENT' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

export interface CertificationApplication {
  id: string;
  researcherId: string; // From Identity Core
  programId: string;
  status: ApplicationStatus;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
