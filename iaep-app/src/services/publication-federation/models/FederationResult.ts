// src/services/publication-federation/models/FederationResult.ts

export interface FederationResult {
  provider: string;
  identifier: string;
  status: 'DISCOVERED' | 'PENDING' | 'FAILED';
  checkedAt: string;
}
