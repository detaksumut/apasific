// src/providers/orcid/IOrcidIdentityProvider.ts

import { IOrcidProfile } from './IOrcidProfile';

export interface IOrcidIdentityProvider {
  exchangeAuthorizationCode(code: string): Promise<IOrcidProfile>;
  verifyIdentity(orcidId: string): Promise<IOrcidProfile>;
}
