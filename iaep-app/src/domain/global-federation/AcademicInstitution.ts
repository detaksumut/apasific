/**
 * Aggregate: AcademicInstitution
 * The institutional node within the APASIFIC Federation (e.g., University, Research Center).
 */
export interface AcademicInstitution {
  id: string;
  institutionName: string;
  country: string;
  type: string;
  status: 'ACTIVE' | 'INACTIVE';
  externalIdentifiers?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}
