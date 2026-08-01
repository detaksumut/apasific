// src/infrastructure/security/authorization.ts
import { AuthContext } from './auth-gateway';
import { logger } from '../observability/logger';

/**
 * Authorization Engine (RBAC + ABAC)
 */
export const AuthorizationEngine = {
  authorize: (context: AuthContext, action: string, resourceType: string, resourceMeta?: any): boolean => {
    
    // 1. RBAC (Role-Based Access Control)
    const hasRolePermission = checkRbac(context.role, action);
    if (!hasRolePermission) {
      logger.warn({ event: 'RBAC_DENIED', action, role: context.role });
      return false;
    }

    // 2. ABAC (Attribute-Based Access Control)
    const hasAttributePermission = checkAbac(context, action, resourceType, resourceMeta);
    if (!hasAttributePermission) {
      logger.warn({ event: 'ABAC_DENIED', action, userId: context.userId, resourceType });
      return false;
    }

    return true;
  }
};

function checkRbac(role: string, action: string): boolean {
  const rbacMatrix: Record<string, string[]> = {
    'Editor': ['ARTICLE_ACCEPTED', 'ARTICLE_REJECTED', 'ASSIGN_REVIEWER'],
    'Reviewer': ['VIEW_MANUSCRIPT', 'SUBMIT_REVIEW'],
    'Author': ['SUBMIT_ARTICLE']
  };

  return rbacMatrix[role]?.includes(action) || false;
}

function checkAbac(context: AuthContext, action: string, resourceType: string, meta: any): boolean {
  if (action === 'VIEW_MANUSCRIPT' && resourceType === 'publication') {
    // ABAC Rule: Reviewer can only view manuscript if assigned AND no COI
    if (context.role === 'Reviewer') {
      return meta?.assignedReviewerId === context.userId && meta?.hasConflictOfInterest === false;
    }
  }
  return true;
}
