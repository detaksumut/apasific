// src/providers/orcid/ORCIDMapper.ts

export interface ORCIDWorkMetadata {
  title: string;
  type: string; // e.g., 'journal-article'
  journalTitle: string;
  publicationDate: string;
  doi: string;
  url: string;
}

export class ORCIDMapper {
  /**
   * Converts internal publication data into ORCID's required XML/JSON schema for a "Work".
   */
  public static mapToORCIDWork(apasificPub: any, zenodoDoi: string): ORCIDWorkMetadata {
    // In a full implementation, this creates the complex ORCID JSON format
    return {
      title: apasificPub.title || 'Untitled Work',
      type: 'journal-article',
      journalTitle: 'APASIFIC Journal',
      publicationDate: apasificPub.publicationDate || new Date().toISOString().split('T')[0],
      doi: zenodoDoi,
      url: `https://doi.org/${zenodoDoi}`
    };
  }
}
