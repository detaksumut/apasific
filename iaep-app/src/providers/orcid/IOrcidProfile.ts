// src/providers/orcid/IOrcidProfile.ts

export interface IOrcidProfile {
  orcidId: string;
  givenName?: string;
  familyName?: string;
  creditName?: string;
  verified: boolean;
}
