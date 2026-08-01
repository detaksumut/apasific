export interface PublicationMetadata {
  identifier: string;
  provider: string;
  title?: string;
  authors?: string[];
  status?: string;
  publicationDate?: Date;
  url?: string;
  sourceType: 'EXTERNAL' | 'INTERNAL';
}

export interface IScholarlyProviderAdapter {
  /**
   * Fetches the scholarly metadata associated with the given identifier.
   */
  fetchMetadata(identifier: string): Promise<PublicationMetadata>;

  /**
   * Validates if the given identifier format is valid for the provider.
   * Also verifies if the record actually exists on the external repository.
   */
  validateIdentifier(identifier: string): Promise<boolean>;
}
