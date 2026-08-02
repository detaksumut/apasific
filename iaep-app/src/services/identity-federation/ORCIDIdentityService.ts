// src/services/identity-federation/ORCIDIdentityService.ts

import { ORCIDProvider } from '../../providers/orcid/ORCIDProvider';
import { ORCIDAdapter } from '../../providers/orcid/ORCIDAdapter';
import { ORCIDMapper } from '../../providers/orcid/ORCIDMapper';
import { IdentityRepository } from '../../repositories/IdentityRepository';

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

      // 2. Duplicate Protection (Rule 3.3)
      const existingLink = await IdentityRepository.findResearcherIdentifier('ORCID', data.orcid);
      if (existingLink && existingLink.researcher_id !== apasificIdentityId) {
        throw new Error(`ORCID iD ${data.orcid} is already linked to another researcher profile.`);
      }

      // 3. Adapt to Identity Evidence Snapshot
      const snapshot = ORCIDAdapter.adaptAuthToIdentitySnapshot(
        apasificIdentityId,
        data.orcid,
        data,
        hash
      );

      // 4. Encrypt Access and Refresh Tokens
      const encryptedAccessToken = ORCIDProvider.encryptToken(data.access_token);
      const encryptedRefreshToken = ORCIDProvider.encryptToken(data.refresh_token);

      // 5. Store snapshot and verify ORCID mapping in IdentityRepository (Rule 3.1 & 3.2)
      await IdentityRepository.linkResearcherIdentifier(
        apasificIdentityId,
        'ORCID',
        'ORCID_ID',
        data.orcid,
        'VERIFIED',
        'USER_CONNECTED',
        {
          identity: {
            scope: data.scope,
            expires_in: data.expires_in,
            connected_at: new Date().toISOString(),
            payload_hash: hash
          },
          credential: {
            encrypted_access_token: encryptedAccessToken,
            encrypted_refresh_token: encryptedRefreshToken
          }
        }
      );

      // 6. Trigger Audit Log / Event (Rule 3.4)
      console.log(`[AUDIT] ResearcherIdentityLinked: researcher_id=${apasificIdentityId}, provider=ORCID, timestamp=${new Date().toISOString()}`);

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

      console.log('Stored ORCID Work Push Snapshot:', snapshot);
      return true;
    } catch (error) {
      console.error(`Failed to push work ${publicationId} to ORCID ${orcidId}`, error);
      throw error;
    }
  }
}
