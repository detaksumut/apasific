// src/infrastructure/tenant/TenantPolicy.ts
import { TenantContext } from './TenantContext';

/**
 * TenantPolicy
 * Manages Feature Flags and subscription tier capabilities for the active tenant.
 */
export const TenantPolicy = {
  hasFeature: (featureName: string): boolean => {
    const context = TenantContext.get();
    if (!context) return false;

    return !!context.features[featureName];
  },

  getTierLevel: (): string => {
    const context = TenantContext.get();
    return (context?.features['subscription_tier'] as string) || 'BASIC';
  },

  enforceFeature: (featureName: string) => {
    if (!TenantPolicy.hasFeature(featureName)) {
      throw new Error(`403 Forbidden: Feature '${featureName}' requires a premium tenant subscription.`);
    }
  }
};
