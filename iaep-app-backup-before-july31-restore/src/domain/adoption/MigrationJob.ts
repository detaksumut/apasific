// src/domain/adoption/MigrationJob.ts

export type MigrationStatus = 'PENDING' | 'PROCESSING' | 'VALIDATION_FAILED' | 'READY_FOR_IMPORT' | 'IMPORTING' | 'COMPLETED' | 'FAILED';

export interface MigrationJob {
  id: string;
  tenantId: string;
  type: 'RESEARCHERS' | 'PUBLICATIONS' | 'CITATIONS';
  status: MigrationStatus;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  fileUrl: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface MigrationMapping {
  jobId: string;
  sourceId: string;
  globalIdentityId?: string;
  status: 'MAPPED' | 'DUPLICATE' | 'CONFLICT' | 'UNRESOLVED';
  confidenceScore: number; // 0.0 - 1.0 AI Confidence
}
