// src/services/publication-federation/OpenAIREDiscoveryService.ts

import { OpenAIREProvider } from '../../providers/openaire/OpenAIREProvider';
import { IOpenAIREProvider } from '../../providers/openaire/IOpenAIREProvider';
import { ExternalPublicationLifecycle, ExternalPublicationState } from '../../domain/external-evidence/ExternalPublicationLifecycle';
import { ExternalEvidenceStore } from '../../domain/external-evidence/ExternalEvidenceStore';

export class OpenAIREDiscoveryService {
  private readonly openAIREProvider: IOpenAIREProvider;
  private readonly evidenceStore: ExternalEvidenceStore;

  constructor() {
    this.openAIREProvider = new OpenAIREProvider();
    this.evidenceStore = new ExternalEvidenceStore();
  }

  /**
   * Harvests metadata from OpenAIRE using a DOI and stores the evidence payload.
   */
  public async discoverPublication(publicationId: string, doi: string): Promise<boolean> {
    try {
      // 1. Fetch from OpenAIRE Provider (Using Provider Runtime implicitly inside provider/manager)
      const { data, hash, isIndexed } = await this.openAIREProvider.searchResearchGraphByDOI(doi);

      if (!isIndexed) {
        return false;
      }

      // 2. Adapt the raw JSON to a domain snapshot via the provider contract
      const snapshot = this.openAIREProvider.adaptToDiscoverySnapshot(publicationId, data, hash);

      // 3. Persist the discovery evidence snapshot (external_discovery_records).
      //    Fail-closed: propagates on persistence error.
      await this.evidenceStore.persistDiscoveryRecord(snapshot);

      // 4. Update the Publication Lifecycle State
      const lifecycle = new ExternalPublicationLifecycle(ExternalPublicationState.INDEXING_PENDING);
      lifecycle.transitionTo(ExternalPublicationState.OPENAIRE_DISCOVERED);
      if (snapshot.status === 'VERIFIED') {
        lifecycle.transitionTo(ExternalPublicationState.GLOBAL_DISCOVERY_VERIFIED);
      }
      
      // TODO: Update lifecycle state in database
      
      return true;
    } catch (error) {
      console.error(`Failed to discover publication ${publicationId} in OpenAIRE`, error);
      throw error;
    }
  }
}
