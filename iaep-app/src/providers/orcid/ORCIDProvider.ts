// src/providers/orcid/ORCIDProvider.ts

import crypto from 'crypto';
import { IOrcidIdentityProvider } from './IOrcidIdentityProvider';
import { IOrcidProfile } from './IOrcidProfile';
import { ORCIDWorkMetadata } from './ORCIDMapper';
import { ProviderRuntimeManager } from '../core/ProviderRuntimeManager';

export class ORCIDProvider implements IOrcidIdentityProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private sandbox: boolean;
  private apiUrl: string;
  private apiBaseUrl: string;

  constructor() {
    this.clientId = process.env.ORCID_CLIENT_ID || '';
    this.clientSecret = process.env.ORCID_CLIENT_SECRET || '';
    this.redirectUri = process.env.ORCID_REDIRECT_URI || 'https://apasific.org/api/auth/orcid/callback';
    this.sandbox = process.env.ORCID_ENVIRONMENT !== 'production';
    this.apiUrl = this.sandbox ? 'https://sandbox.orcid.org' : 'https://orcid.org';
    this.apiBaseUrl = this.sandbox ? 'https://api.sandbox.orcid.org/v3.0' : 'https://api.orcid.org/v3.0';
  }

  /**
   * Generates the authorization URL for initiating OAuth 2.0 flow.
   */
  public getAuthorizationUrl(state: string): string {
    const scopes = '/authenticate'; // Basic authentication scope for ID verification
    return `${this.apiUrl}/oauth/authorize?client_id=${this.clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}`;
  }

  /**
   * Exchanges authorization code for verified ORCID access token and profile info.
   */
  public async exchangeAuthorizationCode(code: string): Promise<IOrcidProfile> {
    const tokenUrl = `${this.apiUrl}/oauth/token`;

    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUri);

    const data = await ProviderRuntimeManager.executeRequest('ORCID', tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      timeoutMs: 15000,
      retryAttempts: 2,
      retryDelayMs: 400
    });

    return {
      orcidId: data.orcid,
      creditName: data.name,
      verified: true,
      // Pass exchange tokens for persistence layer to encrypt and store
      _tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: data.scope,
        expiresIn: data.expires_in
      }
    } as any;
  }

  /**
   * Reads person details from ORCID API using verified ID.
   */
  public async verifyIdentity(orcidId: string): Promise<IOrcidProfile> {
    const url = `${this.apiBaseUrl}/${orcidId}/person`;

    const data = await ProviderRuntimeManager.executeRequest('ORCID', url, {
      headers: {
        'Accept': 'application/json'
      },
      timeoutMs: 15000,
      retryAttempts: 2,
      retryDelayMs: 400
    });
    const nameData = data?.name;

    return {
      orcidId,
      givenName: nameData?.['given-names']?.value || '',
      familyName: nameData?.['family-name']?.value || '',
      creditName: nameData?.['credit-name']?.value || '',
      verified: true
    };
  }

  /**
   * Backward-compatibility wrapper for ORCIDIdentityService
   */
  public async authorizeIdentity(authorizationCode: string): Promise<{ data: any, hash: string }> {
    try {
      const profile = await this.exchangeAuthorizationCode(authorizationCode);
      const tokens = (profile as any)._tokens;

      const payload = {
        access_token: tokens.accessToken,
        token_type: 'bearer',
        refresh_token: tokens.refreshToken,
        expires_in: tokens.expiresIn,
        scope: tokens.scope,
        name: profile.creditName || '',
        orcid: profile.orcidId
      };

      const payloadString = JSON.stringify(payload);
      const hash = crypto.createHash('sha256').update(payloadString).digest('hex');

      return {
        data: payload,
        hash
      };
    } catch (e) {
      // Fail-closed: never return a mock/fabricated token.
      // Missing ORCID credentials or a failed exchange must surface as an error.
      console.error("ORCID authorization code exchange failed; failing closed (no mock fallback).", e);
      throw e;
    }
  }

  /**
   * Pushes a new Work (Publication) to the researcher's ORCID profile via the
   * real ORCID Member API. All external communication is routed through
   * ProviderRuntimeManager. No mock/fabricated put-code is ever returned.
   */
  public async pushWorkToProfile(orcidId: string, accessToken: string, workData: ORCIDWorkMetadata): Promise<{ data: any, hash: string }> {
    if (!accessToken) {
      throw new Error('ORCID access token is required to push a work to a profile.');
    }

    // ORCID Work JSON payload (v3.0 schema).
    const workPayload = {
      title: {
        title: workData.title
      },
      type: workData.type,
      'journal-title': workData.journalTitle ? { title: workData.journalTitle } : undefined,
      'publication-date': workData.publicationDate ? {
        year: { value: workData.publicationDate.slice(0, 4) },
        month: workData.publicationDate.length >= 7 ? { value: workData.publicationDate.slice(5, 7) } : undefined,
        day: workData.publicationDate.length >= 10 ? { value: workData.publicationDate.slice(8, 10) } : undefined
      } : undefined,
      'external-ids': {
        'external-id': [
          {
            'external-id-type': 'doi',
            'external-id-value': workData.doi,
            'external-id-url': { value: workData.url },
            'external-id-relationship': 'self'
          }
        ]
      }
    };

    const url = `${this.apiBaseUrl}/${orcidId}/work`;
    const data = await ProviderRuntimeManager.executeRequest('ORCID', url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/vnd.orcid+json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(workPayload),
      timeoutMs: 20000,
      retryAttempts: 2,
      retryDelayMs: 500
    });

    const payloadString = JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(payloadString).digest('hex');

    return {
      data,
      hash
    };
  }

  /**
   * Resolves the encryption key for token protection without any hardcoded
   * fallback. Fail-closed: throws when ENCRYPTION_KEY is absent.
   */
  private static getEncryptionKey(): Buffer {
    const keyString = process.env.ENCRYPTION_KEY;
    if (!keyString) {
      throw new Error('ENCRYPTION_KEY is not configured. Refusing to encrypt/decrypt with a hardcoded fallback key.');
    }
    // Derive a 32-byte key from the configured secret.
    return crypto.createHash('sha256').update(keyString).digest();
  }

  /**
   * Symmetrically encrypts a sensitive token before database storage.
   * Requires ENCRYPTION_KEY. No hardcoded fallback key.
   */
  public static encryptToken(token: string): string {
    const key = ORCIDProvider.getEncryptionKey();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts an encrypted token.
   * Requires ENCRYPTION_KEY. No hardcoded fallback key.
   */
  public static decryptToken(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted token format');

    const key = ORCIDProvider.getEncryptionKey();
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
