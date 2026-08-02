// src/services/publication-federation/contracts/IIndexVerificationProvider.ts

import { FederationResult } from '../models/FederationResult';

export interface IIndexVerificationProvider {
  verify(identifier: string): Promise<FederationResult>;
}
