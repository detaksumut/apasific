// src/providers/sinta/SintaProvider.ts
import { ISintaProvider } from '../contracts/SintaProviderContract';
import { ExternalEvidenceSnapshot } from '../../domain/external-evidence/ExternalEvidenceSnapshot';
import { SintaAdapter } from './SintaAdapter';
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';
import { SintaIdentityMapper } from './SintaIdentityMapper';

export class SintaProvider implements ISintaProvider {
  private adapter: SintaAdapter;

  constructor() {
    this.adapter = new SintaAdapter();
  }

  async verifyResearcherIdentity(identifier: string): Promise<ExternalEvidenceSnapshot> {
    // Real Sinta author profile via SintaAdapter (routed through ProviderRuntimeManager).
    // No hardcoded/mock researcher data.
    const rawData = await this.adapter.getAuthorProfile(identifier);

    const snapshot: ExternalEvidenceSnapshot = {
      id: `evd_sinta_${Date.now()}`,
      provider: 'SINTA',
      providerEntityId: identifier,
      apasificIdentityId: SintaIdentityMapper.mapToApasificIdentity(rawData),
      evidenceType: 'IDENTITY',
      payloadHash: ProviderRuntimeManager.generatePayloadHash(rawData),
      payload: rawData,
      verifiedAt: new Date(),
      sourceTimestamp: new Date()
    };

    return snapshot;
  }

  async fetchPublications(researcherId: string): Promise<ExternalEvidenceSnapshot> {
    // Real Sinta author publications via SintaAdapter (routed through ProviderRuntimeManager).
    const rawData = await this.adapter.getAuthorPublications(researcherId);

    return {
      id: `evd_sinta_pub_${Date.now()}`,
      provider: 'SINTA',
      providerEntityId: researcherId,
      evidenceType: 'PUBLICATION',
      payloadHash: ProviderRuntimeManager.generatePayloadHash(rawData),
      payload: rawData,
      verifiedAt: new Date(),
      sourceTimestamp: new Date()
    };
  }

  async fetchInstitution(institutionId: string): Promise<ExternalEvidenceSnapshot> {
    // Fail-closed: institution lookup is not yet supported by the Sinta adapter.
    // Throwing is preferred over fabricating institution data.
    throw new Error('Sinta institution lookup is not yet supported by the adapter.');
  }

  async fetchImpactSignals(researcherId: string): Promise<ExternalEvidenceSnapshot> {
    // Fail-closed: impact-signal sync is not yet supported by the Sinta adapter.
    // Throwing is preferred over fabricating impact metrics.
    throw new Error('Sinta impact-signal sync is not yet supported by the adapter.');
  }
}
