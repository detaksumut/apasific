// src/providers/contracts/IExternalIdentityProvider.ts

export interface IExternalIdentityProvider {
  buildAuthorizeUrl(state: string): string;
  exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scope?: string;
    externalId: string;
    name?: string;
  }>;
  fetchProfile(accessToken: string, externalId: string): Promise<{
    externalId: string;
    email?: string;
    givenName?: string;
    familyName?: string;
    creditName?: string;
  }>;
  validateScope(scope: string): boolean;
  mapIdentity(externalId: string): Promise<{
    linked: boolean;
    userId?: string;
    role?: string;
    fullName?: string;
  }>;
  health(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    reason: string;
  }>;
}
