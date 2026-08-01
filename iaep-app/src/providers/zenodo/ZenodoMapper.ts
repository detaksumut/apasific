// src/providers/zenodo/ZenodoMapper.ts

export interface ApasificAuthor {
  name: string;
  affiliation: string;
  orcid?: string;
  apasificId?: string;
}

export interface ApasificRelatedWork {
  identifier: string; // e.g., DOI or URL
  relationType: 'isSupplementTo' | 'isCompiledBy' | 'cites' | 'isCitedBy' | string;
}

export interface ApasificPublicationMetadata {
  title: string;
  authors: ApasificAuthor[];
  abstract: string;
  keywords: string[];
  license: string;
  publicationDate: string;
  journalName: string;
  volume: string;
  issue: string;
  relatedWorks?: ApasificRelatedWork[];
}

export interface ZenodoMetadata {
  metadata: {
    title: string;
    upload_type: 'publication';
    publication_type: 'article';
    description: string;
    creators: Array<{ name: string; affiliation?: string; orcid?: string }>;
    keywords: string[];
    publication_date: string;
    license: string;
    journal_title?: string;
    journal_volume?: string;
    journal_issue?: string;
    related_identifiers?: Array<{ identifier: string; relation: string }>;
  }
}

export class ZenodoMapper {
  public static mapToZenodoMetadata(apasificData: ApasificPublicationMetadata): ZenodoMetadata {
    return {
      metadata: {
        title: apasificData.title,
        upload_type: 'publication',
        publication_type: 'article',
        description: apasificData.abstract,
        creators: apasificData.authors.map(author => {
          const creator: any = {
            name: author.name,
            affiliation: author.affiliation
          };
          // Map ORCID for future O.4 federation
          if (author.orcid) {
            creator.orcid = author.orcid;
          }
          // Note: Zenodo standard creators schema supports ORCID. 
          // Custom APASIFIC IDs might be added via custom fields or description in advanced implementations.
          return creator;
        }),
        keywords: apasificData.keywords,
        publication_date: apasificData.publicationDate,
        license: apasificData.license || 'CC-BY-4.0', // License Governance: CC-BY-4.0 default
        journal_title: apasificData.journalName,
        journal_volume: apasificData.volume,
        journal_issue: apasificData.issue,
        related_identifiers: apasificData.relatedWorks?.map(rw => ({
          identifier: rw.identifier,
          relation: rw.relationType
        }))
      }
    };
  }
}
