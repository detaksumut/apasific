import { providerRuntime } from '../scholarly-integration/runtime/ProviderRuntimeManager';
import { ProviderCapability } from '../../domain/research-integration/ProviderCapabilities';
import { PublicationIdentity } from '../../domain/publication-intelligence/PublicationIdentity';

/**
 * Phase H.4 & H.5: Publication Identity Manager
 * Governs all outward interactions concerning publications via the Provider Runtime.
 */
export class PublicationIdentityManager {

  /**
   * Requests DOI registration via an external provider (e.g., Crossref).
   */
  public async registerDOI(providerCode: string, scholarlyWorkId: string, metadata: unknown): Promise<PublicationIdentity> {
    try {
      // Calls the Runtime Manager ensuring loose coupling.
      const response = await providerRuntime.executeCapability(providerCode, (ProviderCapability as any).DOI_REGISTRATION, metadata) as { doi: string };
      
      // Return constructed PublicationIdentity aggregate
      return {
        id: crypto.randomUUID(),
        scholarlyWorkId,
        doi: response.doi,
        ssrnId: null,
        zenodoId: null,
        repositoryId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error(`DOI Registration failed via ${providerCode}`, error);
      throw new Error(`Failed to register DOI: ${error instanceof Error ? error.message : 'Unknown Error'}`);
    }
  }

  /**
   * Verifies if a scholarly work is indexed in a specific database (e.g., Scopus).
   */
  public async verifyIndexing(providerCode: string, doi: string): Promise<boolean> {
    try {
      const response = await providerRuntime.executeCapability(providerCode, (ProviderCapability as any).INDEXING_VERIFICATION, { doi }) as { isIndexed: boolean };
      return response.isIndexed;
    } catch (error) {
      console.error(`Indexing Verification failed via ${providerCode}`, error);
      return false;
    }
  }
}
