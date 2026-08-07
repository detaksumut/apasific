export interface CertificationProgram {
  id: string;
  code: string;
  name: string;
  category: string;
  level: string;
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  activePolicyId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
