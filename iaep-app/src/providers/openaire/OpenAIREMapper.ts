// src/providers/openaire/OpenAIREMapper.ts

export interface OpenAIREMetadata {
  title: string;
  doi: string;
  authors: Array<{ name: string; orcid?: string }>;
  organizations: Array<{ name: string; id?: string }>;
  subjects: string[];
  relatedDatasets: Array<{ identifier: string; relation: string }>;
}

export class OpenAIREMapper {
  /**
   * Maps raw OpenAIRE API JSON response into a standardized OpenAIREMetadata structure.
   */
  public static mapRawToMetadata(rawJson: any): OpenAIREMetadata {
    // OpenAIRE's schema is complex, so we safely extract the needed parts.
    // This assumes parsing from a typical OpenAIRE Graph API result.
    const result = rawJson?.response?.results?.result?.[0]?.metadata?.['oaf:entity']?.['oaf:result'];

    if (!result) {
      throw new Error('Invalid or missing OpenAIRE payload structure');
    }

    const title = Array.isArray(result.title) ? result.title[0]?.content : (result.title?.content || 'Unknown Title');
    
    // Extract authors (creators)
    const authors = [];
    if (result.creator) {
      const creators = Array.isArray(result.creator) ? result.creator : [result.creator];
      for (const c of creators) {
        authors.push({
          name: c.content || c['@name'] || 'Unknown Author',
          orcid: c['@ORCID'] || undefined
        });
      }
    }

    // Extract subjects
    const subjects = [];
    if (result.subject) {
      const subjs = Array.isArray(result.subject) ? result.subject : [result.subject];
      for (const s of subjs) {
        if (s.content) subjects.push(s.content);
      }
    }

    return {
      title,
      doi: rawJson._originalDoi || '', // Injected by adapter for mapping
      authors,
      organizations: [], // Will map from institutional affiliations if present in graph
      subjects,
      relatedDatasets: [] // Will map from relations if present
    };
  }
}
