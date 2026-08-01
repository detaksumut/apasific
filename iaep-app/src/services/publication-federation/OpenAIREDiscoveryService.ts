// src/services/publication-federation/OpenAIREDiscoveryService.ts

import { OpenAIREProvider } from '../../providers/openaire/OpenAIREProvider';
import { OpenAIREAdapter } from '../../providers/openaire/OpenAIREAdapter';
import { ExternalPublicationLifecycle, ExternalPublicationState } from '../../domain/external-evidence/ExternalPublicationLifecycle';

export class OpenAIREDiscoveryService {
  private openAireProvider: OpenAIREProvider;

  constructor() {
    this.openAireProvider = new OpenAIREProvider();
  }

  /**
   * Harvests metadata from OpenAIRE using a DOI and stores the evidence payload.
   */
  public async discoverPublication(publicationId: string, doi: string): Promise<boolean> {
    try {
      // 1. Fetch from OpenAIRE Provider (Using Provider Runtime implicitly inside provider/manager)
      const { data, hash, isIndexed } = await this.openAireProvider.searchResearchGraphByDOI(doi);

      if (!isIndexed) {
        return false;
      }

      // 2. Adapt the raw JSON to a domain snapshot
      const snapshot = OpenAIREAdapter.adaptResponseToSnapshot(publicationId, data, hash);

      // 3. TODO: Store the snapshot into external_discovery_records in Supabase
      // e.g. await supabase.from('external_discovery_records').insert({...snapshot})

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
