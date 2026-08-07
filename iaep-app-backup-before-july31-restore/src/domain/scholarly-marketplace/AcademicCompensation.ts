export type CompensationStatus = 'PENDING' | 'AUTHORIZED' | 'COMPLETED' | 'DISPUTED';

/**
 * Aggregate: AcademicCompensation
 * APASIFIC's tracking ledger for compensation (not a direct clearinghouse).
 */
export interface AcademicCompensation {
  id: string;
  engagementId: string;
  amount: number;
  currency: string;
  status: CompensationStatus;
  createdAt: Date;
  updatedAt: Date;
}
