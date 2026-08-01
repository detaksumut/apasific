export interface AssessmentRecord {
  id: string;
  applicationId: string;
  type: string; // E.g., 'exam', 'interview', 'portfolio'
  score: number;
  evaluatorId: string | null;
  evidenceDocument: string | null;
  completedAt: Date;
  createdAt: Date;
}
