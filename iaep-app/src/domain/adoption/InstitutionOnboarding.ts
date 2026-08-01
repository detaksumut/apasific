// src/domain/adoption/InstitutionOnboarding.ts

export type OnboardingStatus = 'INITIATED' | 'DOMAIN_VERIFICATION_PENDING' | 'DOMAIN_VERIFIED' | 'TENANT_PROVISIONING' | 'ADMIN_ASSIGNED' | 'ACTIVE';

export interface InstitutionOnboarding {
  id: string;
  institutionName: string;
  domain: string;
  applicantEmail: string;
  status: OnboardingStatus;
  dnsTxtChallenge: string;
  requestedAt: Date;
  verifiedAt?: Date;
  activatedAt?: Date;
}
