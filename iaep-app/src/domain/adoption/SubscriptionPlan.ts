// src/domain/adoption/SubscriptionPlan.ts

export type Tier = 'FREE_ACADEMIC_NODE' | 'PROFESSIONAL_INSTITUTION' | 'ENTERPRISE_UNIVERSITY' | 'GLOBAL_FEDERATION_PARTNER';

export interface SubscriptionPlan {
  id: string;
  tier: Tier;
  features: string[];
  maxMembers: number;
  monthlyAiTokens: number;
}

export interface TenantSubscription {
  tenantId: string;
  planId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  startDate: Date;
  renewalDate: Date;
}
