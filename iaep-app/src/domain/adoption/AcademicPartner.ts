// src/domain/adoption/AcademicPartner.ts

export type PartnerType = 'UNIVERSITY' | 'RESEARCH_INSTITUTE' | 'ACCREDITATION_AGENCY' | 'CONFERENCE_ORGANIZER' | 'PUBLISHER' | 'FUNDING_ORGANIZATION';

export interface AcademicPartner {
  id: string;
  name: string;
  type: PartnerType;
  country: string;
  federationStatus: 'PENDING' | 'INTEGRATED' | 'INACTIVE';
  joinedAt: Date;
}
