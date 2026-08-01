// src/domain/adoption/SupportCase.ts

export type CaseStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type CasePriority = 'P1_CRITICAL' | 'P2_ENTERPRISE' | 'P3_STANDARD' | 'P4_REQUEST';

export interface EnterpriseSupportCase {
  id: string;
  tenantId: string;
  subject: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedAgentId?: string;
  createdAt: Date;
  resolvedAt?: Date;
}
