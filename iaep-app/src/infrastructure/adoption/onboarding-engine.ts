// src/infrastructure/adoption/onboarding-engine.ts
import { InstitutionOnboarding, OnboardingStatus } from '../../domain/adoption/InstitutionOnboarding';
import { logger } from '../observability/logger';
import { generateDnsChallenge } from './dns-verification';

export const OnboardingEngine = {
  initiate: async (institutionName: string, domain: string, applicantEmail: string): Promise<InstitutionOnboarding> => {
    const challenge = generateDnsChallenge();
    
    const onboarding: InstitutionOnboarding = {
      id: `obs_${Date.now()}`,
      institutionName,
      domain,
      applicantEmail,
      status: 'DOMAIN_VERIFICATION_PENDING',
      dnsTxtChallenge: challenge,
      requestedAt: new Date()
    };

    logger.info({ event: 'ONBOARDING_INITIATED', domain, challenge });
    // Persist to DB here
    return onboarding;
  },

  advanceStatus: (onboardingId: string, newStatus: OnboardingStatus) => {
    // Moves state through: DOMAIN_VERIFIED -> TENANT_PROVISIONING -> ADMIN_ASSIGNED -> ACTIVE
    logger.info({ event: 'ONBOARDING_STATUS_CHANGED', onboardingId, newStatus });
  }
};
