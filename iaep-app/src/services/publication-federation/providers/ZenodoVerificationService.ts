// src/services/publication-federation/providers/ZenodoVerificationService.ts

import { IIndexVerificationProvider } from '../contracts/IIndexVerificationProvider';
import { FederationResult } from '../models/FederationResult';

export class ZenodoVerificationService implements IIndexVerificationProvider {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    const environment = process.env.ZENODO_ENVIRONMENT || 'sandbox';
    this.apiUrl = environment === 'production' 
      ? 'https://zenodo.org/api' 
      : 'https://sandbox.zenodo.org/api';
    this.apiToken = process.env.ZENODO_API_TOKEN || '';
  }

  public async verify(recordId: string): Promise<FederationResult> {
    try {
      const url = `${this.apiUrl}/records/${recordId}`;
      const response = await fetch(url, {
        headers: this.apiToken ? { 'Authorization': `Bearer ${this.apiToken}` } : {}
      });

      if (response.ok) {
        return {
          provider: 'zenodo',
          identifier: recordId,
          status: 'DISCOVERED',
          checkedAt: new Date().toISOString()
        };
      }
      return {
        provider: 'zenodo',
        identifier: recordId,
        status: 'PENDING',
        checkedAt: new Date().toISOString()
      };
    } catch (e) {
      return {
        provider: 'zenodo',
        identifier: recordId,
        status: 'FAILED',
        checkedAt: new Date().toISOString()
      };
    }
  }
}
