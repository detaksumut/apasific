/**
 * Aggregate: MembershipType
 * Defines the categories of membership and acts as the source for Access Entitlement Rules.
 */
export interface MembershipType {
  id: string;
  code: string; // e.g., 'PROFESSIONAL', 'STUDENT'
  name: string;
  category: string;
  requirements: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}
