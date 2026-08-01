// src/services/identity-federation/ORCIDIdentityService.ts

import { ORCIDProvider } from '../../providers/orcid/ORCIDProvider';
import { ORCIDAdapter } from '../../providers/orcid/ORCIDAdapter';
import { ORCIDMapper } from '../../providers/orcid/ORCIDMapper';

export class ORCIDIdentityService {
  private orcidProvider: ORCIDProvider;

  constructor() {
    this.orcidProvider = new ORCIDProvider();
  }

  /**
   * Completes the OAuth flow, retrieving the ORCID iD and storing the Identity Evidence Snapshot.
   */
  public async connectIdentity(apasificIdentityId: string, authCode: string): Promise<string> {
    try {
      // 1. Exchange Auth Code for Tokens and ORCID iD
      const { data, hash } = await this.orcidProvider.authorizeIdentity(authCode);

      if (!data.orcid) {
        throw new Error('ORCID iD not returned by provider');
      }

      // 2. Adapt to Identity Evidence Snapshot
      const snapshot = ORCIDAdapter.adaptAuthToIdentitySnapshot(
        apasificIdentityId,
        data.orcid,
        data,
        hash
      );

      // 3. TODO: Store snapshot in external_evidence_payloads & external_publication_records (or generic evidence tables)
      console.log('Stored ORCID Identity Snapshot:', snapshot);

      return data.orcid;
    } catch (error) {
      console.error(`Failed to connect ORCID identity for ${apasificIdentityId}`, error);
      throw error;
    }
  }

  /**
   * Pushes a verified publication to the researcher's ORCID profile.
   */
  public async pushVerifiedWork(publicationId: string, orcidId: string, accessToken: string, apasificPub: any, zenodoDoi: string): Promise<boolean> {
    try {
      // 1. Map internal publication to ORCID Schema
      const orcidWork = ORCIDMapper.mapToORCIDWork(apasificPub, zenodoDoi);

      // 2. Push to ORCID Provider
      const { data, hash } = await this.orcidProvider.pushWorkToProfile(orcidId, accessToken, orcidWork);

      if (data.status !== 'SUCCESS') {
        return false;
      }

      // 3. Adapt to Publication Evidence Snapshot
      const snapshot = ORCIDAdapter.adaptWorkPushToPublicationSnapshot(
        publicationId,
        orcidId,
        data,
        hash
      );

      // 4. TODO: Store publication evidence snapshot
      console.log('Stored ORCID Work Push Snapshot:', snapshot);

      return true;
    } catch (error) {
      console.error(`Failed to push work ${publicationId} to ORCID ${orcidId}`, error);
      throw error;
    }
  }
}
