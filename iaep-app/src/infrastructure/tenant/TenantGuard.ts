// src/infrastructure/tenant/TenantGuard.ts
import { TenantContext } from './TenantContext';
import { logger } from '../observability/logger';

/**
 * TenantGuard
 * Cross-Tenant Isolation Enforcement.
 * Validates that requested resources belong to the currently resolved Tenant Context.
 */
export const TenantGuard = {
  verifyResourceOwnership: (resourceTenantId: string, resourceId: string) => {
    const currentTenantId = TenantContext.getCurrentTenantId();

    if (currentTenantId !== resourceTenantId) {
      logger.error({ 
        event: 'CROSS_TENANT_VIOLATION_ATTEMPT', 
        attemptedTenant: currentTenantId,
        resourceTenant: resourceTenantId,
        resourceId
      });
      throw new Error('403 Forbidden: Cross-Tenant Isolation Violation');
    }
  },

  isGlobalVisibilityAllowed: (visibilityRule: 'PUBLIC' | 'INSTITUTION_ONLY' | 'PRIVATE'): boolean => {
    // Defines if a resource generated in a tenant can be indexed by Global APASIFIC Search
    return visibilityRule === 'PUBLIC';
  }
};
