// src/providers/orcid/OrcidClient.ts

import crypto from 'crypto';
import { IOrcidIdentityProvider } from './IOrcidIdentityProvider';
import { IOrcidProfile } from './IOrcidProfile';

export class OrcidClient implements IOrcidIdentityProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private sandbox: boolean;

  constructor() {
    this.clientId = process.env.ORCID_CLIENT_ID || '';
    this.clientSecret = process.env.ORCID_CLIENT_SECRET || '';
    this.redirectUri = process.env.ORCID_REDIRECT_URI || 'https://apasific.org/api/auth/orcid/callback';
    this.sandbox = process.env.ORCID_ENVIRONMENT !== 'production';
  }

  private getBaseUrl(): string {
    return this.sandbox ? 'https://sandbox.orcid.org' : 'https://orcid.org';
  }

  private getApiBaseUrl(): string {
    return this.sandbox ? 'https://api.sandbox.orcid.org/v3.0' : 'https://api.orcid.org/v3.0';
  }

  /**
   * Generates the authorization URL for initiating OAuth 2.0 flow.
   */
  public getAuthorizationUrl(state: string): string {
    const baseUrl = this.getBaseUrl();
    const scopes = '/authenticate'; // Basic authentication scope for ID verification
    return `${baseUrl}/oauth/authorize?client_id=${this.clientId}&response_type=code&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}`;
  }

  /**
   * Exchanges authorization code for verified ORCID access token and profile info.
   */
  public async exchangeAuthorizationCode(code: string): Promise<IOrcidProfile> {
    const baseUrl = this.getBaseUrl();
    const tokenUrl = `${baseUrl}/oauth/token`;

    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', this.redirectUri);

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ORCID OAuth Exchange Failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      orcidId: data.orcid,
      creditName: data.name,
      verified: true,
      // Temporarily attach exchange tokens for persistence layer to encrypt and store
      _tokens: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        scope: data.scope,
        expiresIn: data.expires_in
      }
    } as any;
  }

  /**
   * Reads public profile details from ORCID API using verified ID.
   */
  public async verifyIdentity(orcidId: string): Promise<IOrcidProfile> {
    const apiBaseUrl = this.getApiBaseUrl();
    const url = `${apiBaseUrl}/${orcidId}/person`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`ORCID Profile Fetch Failed for ID: ${orcidId}`);
    }

    const data = await response.json();
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
   * Symmetrically encrypts a sensitive token before database storage.
   */
  public static encryptToken(token: string): string {
    const keyString = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'apasific-sec-key-32-bytes-fallback';
    const key = crypto.createHash('sha256').update(keyString).digest();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts an encrypted token.
   */
  public static decryptToken(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted token format');

    const keyString = process.env.ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'apasific-sec-key-32-bytes-fallback';
    const key = crypto.createHash('sha256').update(keyString).digest();
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
