// src/services/publication-federation/DataCiteFederationService.ts

import { DataCiteProvider } from '../../providers/datacite/DataCiteProvider';
import { IDataCiteProvider } from '../../providers/datacite/IDataCiteProvider';
import { DataCiteAdapter } from '../../providers/datacite/DataCiteAdapter';
import { DataCiteMapper, DataCiteArtifactMetadata } from '../../providers/datacite/DataCiteMapper';
import { ExternalEvidenceStore } from '../../domain/external-evidence/ExternalEvidenceStore';

export class DataCiteFederationService {
  private readonly dataCiteProvider: IDataCiteProvider;
  private readonly evidenceStore: ExternalEvidenceStore;

  constructor() {
    this.dataCiteProvider = new DataCiteProvider();
    this.evidenceStore = new ExternalEvidenceStore();
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

      // 4. Persist the evidence snapshot (external_publication_records +
      //    external_evidence_payloads). Fail-closed: propagates on persistence error.
      await this.evidenceStore.persistExternalRecord(snapshot);

      return data.data.id;
    } catch (error) {
      console.error(`Failed to register DataCite DOI for artifact of publication ${publicationId}`, error);
      throw error;
    }
  }
}
