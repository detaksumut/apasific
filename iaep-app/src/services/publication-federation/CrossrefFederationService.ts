// src/services/publication-federation/CrossrefFederationService.ts

import { CrossrefProvider } from '../../providers/crossref/CrossrefProvider';
import { ICrossrefProvider } from '../../providers/crossref/ICrossrefProvider';
import { CrossrefAdapter } from '../../providers/crossref/CrossrefAdapter';
import { CrossrefMapper, CrossrefDepositMetadata } from '../../providers/crossref/CrossrefMapper';
import { ExternalEvidenceStore } from '../../domain/external-evidence/ExternalEvidenceStore';

export class CrossrefFederationService {
  private readonly crossrefProvider: ICrossrefProvider;
  private readonly evidenceStore: ExternalEvidenceStore;

  constructor() {
    this.crossrefProvider = new CrossrefProvider();
    this.evidenceStore = new ExternalEvidenceStore();
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

      // 4. Persist the evidence snapshot (external_publication_records +
      //    external_evidence_payloads). Fail-closed: propagates on persistence error.
      await this.evidenceStore.persistExternalRecord(snapshot);

      return metadata.doi;
    } catch (error) {
      console.error(`Failed to register Crossref DOI for publication ${publicationId}`, error);
      throw error;
    }
  }
}
