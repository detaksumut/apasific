// src/infrastructure/adoption/subscription.ts
import { Tier, TenantSubscription } from '../../domain/adoption/SubscriptionPlan';

export const SubscriptionGovernance = {
  getTenantEntitlements: (tenantId: string): string[] => {
    // Query DB for TenantSubscription
    const mockTier: Tier = 'ENTERPRISE_UNIVERSITY';
    
    return buildFeaturesFromTier(mockTier);
  }
};

function buildFeaturesFromTier(tier: Tier): string[] {
  const base = ['Membership', 'Basic Publication'];
  
  if (tier === 'FREE_ACADEMIC_NODE') return base;
  
  const professional = [...base, 'Analytics', 'Reviewer Network'];
  if (tier === 'PROFESSIONAL_INSTITUTION') return professional;
  
  const enterprise = [...professional, 'AI Intelligence', 'Digital Twin', 'Advanced Reporting'];
  if (tier === 'ENTERPRISE_UNIVERSITY') return enterprise;
  
  const global = [...enterprise, 'Federation API', 'Global Intelligence'];
  return global;
}
