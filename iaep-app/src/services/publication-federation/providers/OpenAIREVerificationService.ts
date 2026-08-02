// src/services/publication-federation/providers/OpenAIREVerificationService.ts

import { IIndexVerificationProvider } from '../contracts/IIndexVerificationProvider';
import { FederationResult } from '../models/FederationResult';

export class OpenAIREVerificationService implements IIndexVerificationProvider {
  private readonly baseUrl = 'https://api.openaire.eu/search/publications';

  public async verify(doi: string): Promise<FederationResult> {
    try {
      const url = `${this.baseUrl}?doi=${encodeURIComponent(doi)}&format=json`;
      const response = await fetch(url);

      if (response.ok) {
        const json = await response.json();
        const total = json?.response?.header?.size?.['$'] || json?.response?.header?.size || 0;
        
        if (Number(total) > 0) {
          return {
            provider: 'openaire',
            identifier: doi,
            status: 'DISCOVERED',
            checkedAt: new Date().toISOString()
          };
        }
      }

      return {
        provider: 'openaire',
        identifier: doi,
        status: 'PENDING',
        checkedAt: new Date().toISOString()
      };
    } catch (e) {
      return {
        provider: 'openaire',
        identifier: doi,
        status: 'FAILED',
        checkedAt: new Date().toISOString()
      };
    }
  }
}
