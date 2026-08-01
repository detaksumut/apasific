/**
 * Aggregate: AffiliationRecord
 * A historical record of academic and institutional associations.
 */
export interface AffiliationRecord {
  id: string;
  memberId: string;
  institutionName: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
