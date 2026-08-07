// src/services/publication-federation/CrossrefFederationService.ts

import { CrossrefProvider } from '../../providers/crossref/CrossrefProvider';
import { CrossrefAdapter } from '../../providers/crossref/CrossrefAdapter';
import { CrossrefMapper, CrossrefDepositMetadata } from '../../providers/crossref/CrossrefMapper';

export class CrossrefFederationService {
  private crossrefProvider: CrossrefProvider;

  constructor() {
    this.crossrefProvider = new CrossrefProvider();
  }

  /**
   * Registers a primary Publisher DOI for an APASIFIC Journal Article via Crossref.
   */
  public async publishArticleDOI(publicationId: string, metadata: CrossrefDepositMetadata): Promise<string> {
    try {
      // 1. Generate XML Deposit Payload
      const xmlPayload = CrossrefMapper.mapToCrossrefXML(metadata);

      // 2. Deposit to Crossref Provider
      const { data, hash } = await this.crossrefProvider.depositXML(xmlPayload, metadata.doi);

      if (data.status !== 'success') {
        throw new Error('Crossref XML Deposit failed to queue');
      }

      // 3. Adapt to External Evidence Snapshot (PUBLISHER_DOI)
      const snapshot = CrossrefAdapter.adaptDepositToSnapshot(
        publicationId,
        metadata.doi,
        data,
        hash
      );

      // 4. TODO: Store the snapshot into external_evidence_payloads in Supabase
      console.log('Stored Crossref Publisher DOI Snapshot:', snapshot);

      return metadata.doi;
    } catch (error) {
      console.error(`Failed to register Crossref DOI for publication ${publicationId}`, error);
      throw error;
    }
  }
}
