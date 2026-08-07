// src/infrastructure/security/audit.ts
import { logger } from '../observability/logger';
import { AuthContext } from './auth-gateway';

/**
 * Enterprise Audit System
 * Immutable logging of Who, What, When, Where.
 */
export const AuditSystem = {
  record: async (
    context: AuthContext,
    action: string,
    resourceType: string,
    resourceId: string,
    traceId: string,
    metadata?: any
  ) => {
    const auditPayload = {
      actor_id: context.userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: context.ipAddress,
      user_agent: context.userAgent,
      trace_id: traceId,
      metadata: metadata || {}
    };

    // 1. Emit telemetry
    logger.info({ event: 'AUDIT_RECORDED', action, resourceId });

    // 2. Persist to PostgreSQL audit_events
    await insertIntoDatabase(auditPayload);
  }
};

async function insertIntoDatabase(payload: any) {
  // Supabase client integration placeholder
  // supabase.from('audit_events').insert([payload])
}
