/**
 * Aggregate: AIGovernancePolicy
 * Defines the strict boundaries for autonomous agent actions.
 * Human-in-the-loop is enforced via these policies.
 */
export interface AIGovernancePolicy {
  id: string;
  agentName: string;
  allowedActions: string[];
  forbiddenActions: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
