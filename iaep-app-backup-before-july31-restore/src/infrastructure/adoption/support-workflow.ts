// src/infrastructure/adoption/support-workflow.ts
import { EnterpriseSupportCase, CasePriority } from '../../domain/adoption/SupportCase';
import { logger } from '../observability/logger';

export const SupportWorkflow = {
  openCase: async (tenantId: string, subject: string, description: string, priority: CasePriority): Promise<EnterpriseSupportCase> => {
    const supportCase: EnterpriseSupportCase = {
      id: `case_${Date.now()}`,
      tenantId,
      subject,
      description,
      status: 'OPEN',
      priority,
      createdAt: new Date()
    };

    logger.info({ event: 'SUPPORT_CASE_OPENED', caseId: supportCase.id, priority });
    
    // In production, this relays via Webhook to Jira/Zendesk API
    
    return supportCase;
  }
};
