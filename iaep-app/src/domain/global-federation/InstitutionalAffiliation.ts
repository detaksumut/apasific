/**
 * Aggregate: InstitutionalAffiliation
 * The definitive link between a researcher and an institution.
 * Supports multi-affiliation and historical tracking.
 */
export interface InstitutionalAffiliation {
  id: string;
  researcherId: string;
  institutionId: string;
  role: string;
  startDate: Date;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
