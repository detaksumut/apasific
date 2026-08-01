// src/providers/datacite/DataCiteMapper.ts

export type ResearchResourceType = 'Dataset' | 'Software' | 'Model' | 'Other';

export interface DataCiteArtifactMetadata {
  title: string;
  creators: Array<{ name: string; orcid?: string }>;
  publisher: string;
  publicationYear: string;
  resourceType: ResearchResourceType;
  relatedPublicationDoi: string; // The Zenodo DOI of the main article
}

export class DataCiteMapper {
  /**
   * Translates internal APASIFIC artifact metadata into DataCite's JSON schema for DOI registration.
   */
  public static mapToDataCitePayload(metadata: DataCiteArtifactMetadata, prefix: string): any {
    return {
      data: {
        type: 'dois',
        attributes: {
          event: 'publish',
          prefix: prefix,
          creators: metadata.creators.map(c => ({
            name: c.name,
            nameType: 'Personal',
            ...(c.orcid ? { nameIdentifiers: [{ nameIdentifier: c.orcid, nameIdentifierScheme: 'ORCID' }] } : {})
          })),
          titles: [{ title: metadata.title }],
          publisher: metadata.publisher,
          publicationYear: metadata.publicationYear,
          types: {
            resourceTypeGeneral: metadata.resourceType === 'Model' ? 'Software' : metadata.resourceType,
            resourceType: metadata.resourceType
          },
          url: `https://apasific.com/artifacts/${crypto.randomUUID()}`, // Placeholder for resolution URL
          relatedIdentifiers: [
            {
              relatedIdentifier: metadata.relatedPublicationDoi,
              relatedIdentifierType: 'DOI',
              relationType: 'IsSupplementTo'
            }
          ]
        }
      }
    };
  }
}
