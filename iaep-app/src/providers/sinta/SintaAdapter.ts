// src/providers/sinta/SintaAdapter.ts
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';

export class SintaAdapter {
  private readonly baseUrl = 'https://sinta.kemdikbud.go.id/api/v1'; // Example Endpoint

  async getAuthorProfile(sintaId: string): Promise<any> {
    return ProviderRuntimeManager.executeRequest(
      'SINTA',
      `${this.baseUrl}/author/${sintaId}`
    );
  }

  async getAuthorPublications(sintaId: string): Promise<any[]> {
    return ProviderRuntimeManager.executeRequest(
      'SINTA',
      `${this.baseUrl}/author/${sintaId}/publications`
    );
  }
}
