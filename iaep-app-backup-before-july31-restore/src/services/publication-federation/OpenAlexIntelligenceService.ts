// src/services/publication-federation/OpenAlexIntelligenceService.ts

import { OpenAlexProvider } from '../../providers/openalex/OpenAlexProvider';
import { OpenAlexAdapter } from '../../providers/openalex/OpenAlexAdapter';
import { OpenAlexMapper } from '../../providers/openalex/OpenAlexMapper';

export class OpenAlexIntelligenceService {
  private openAlexProvider: OpenAlexProvider;

  constructor() {
    this.openAlexProvider = new OpenAlexProvider();
  }

  /**
   * Orchestrates fetching intelligence from OpenAlex and storing the evidence snapshot.
   */
  public async fetchIntelligence(publicationId: string, zenodoDoi: string): Promise<boolean> {
    try {
      // 1. Fetch from OpenAlex Provider
      const { data, hash, isFound } = await this.openAlexProvider.fetchIntelligenceByDOI(zenodoDoi);

      if (!isFound || !data) {
        return false;
      }

      // 2. Map to Intelligence Metrics
      const intelligenceMetrics = OpenAlexMapper.mapWorkToIntelligence(data);

      // 3. Adapt to Discovery Evidence Snapshot
      const snapshot = OpenAlexAdapter.adaptIntelligenceToSnapshot(
        publicationId,
        intelligenceMetrics,
        data,
        hash
      );

      // 4. TODO: Store the snapshot into external_discovery_records in Supabase
      console.log('Stored OpenAlex Discovery Snapshot:', snapshot);

      return true;
    } catch (error) {
      console.error(`Failed to fetch OpenAlex intelligence for publication ${publicationId}`, error);
      throw error;
    }
  }
}
