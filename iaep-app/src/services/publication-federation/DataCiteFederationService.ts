// src/services/publication-federation/DataCiteFederationService.ts

import { DataCiteProvider } from '../../providers/datacite/DataCiteProvider';
import { DataCiteAdapter } from '../../providers/datacite/DataCiteAdapter';
import { DataCiteMapper, DataCiteArtifactMetadata } from '../../providers/datacite/DataCiteMapper';

export class DataCiteFederationService {
  private dataCiteProvider: DataCiteProvider;

  constructor() {
    this.dataCiteProvider = new DataCiteProvider();
  }

  /**
   * Registers a DataCite DOI for a specific artifact and links it to the main publication DOI.
   */
  public async registerArtifact(publicationId: string, metadata: DataCiteArtifactMetadata): Promise<string | null> {
    try {
      // 1. Map to DataCite JSON payload
      const payload = DataCiteMapper.mapToDataCitePayload(metadata, this.dataCiteProvider.getPrefix());

      // 2. Push to DataCite Provider
      const { data, hash } = await this.dataCiteProvider.registerArtifactDOI(payload);

      if (!data?.data?.id) {
        throw new Error('DataCite DOI registration failed');
      }

      // 3. Adapt to External Evidence Snapshot (Dataset/Artifact type)
      const snapshot = DataCiteAdapter.adaptRegistrationToSnapshot(
        publicationId,
        data,
        hash
      );

      // 4. TODO: Store the snapshot into external_evidence_payloads in Supabase
      console.log('Stored DataCite Artifact Snapshot:', snapshot);

      return data.data.id;
    } catch (error) {
      console.error(`Failed to register DataCite DOI for artifact of publication ${publicationId}`, error);
      throw error;
    }
  }
}
