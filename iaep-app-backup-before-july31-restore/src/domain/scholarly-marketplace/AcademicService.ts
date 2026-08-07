/**
 * Aggregate: AcademicService
 * A service offering from a researcher (e.g. Peer Review, Consultation).
 * Must be backed by evidence to be visible.
 */
export interface AcademicService {
  id: string;
  providerId: string;
  serviceType: string;
  description: string;
  expertiseAreas: string[];
  availability: 'AVAILABLE' | 'UNAVAILABLE';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
