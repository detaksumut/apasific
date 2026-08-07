// src/providers/openalex/OpenAlexMapper.ts

export interface OpenAlexIntelligenceMetrics {
  citationCount: number;
  concepts: Array<{ id: string; display_name: string; score: number }>;
  relatedAuthors: Array<{ id: string; display_name: string }>;
  relatedInstitutions: Array<{ id: string; display_name: string }>;
  openAlexId: string;
}

export class OpenAlexMapper {
  /**
   * Translates the raw OpenAlex Work Graph response into focused APASIFIC Intelligence Metrics.
   */
  public static mapWorkToIntelligence(rawWorkJson: any): OpenAlexIntelligenceMetrics {
    const concepts = rawWorkJson?.concepts?.map((c: any) => ({
      id: c.id,
      display_name: c.display_name,
      score: c.score
    })) || [];

    const relatedAuthors = rawWorkJson?.authorships?.map((a: any) => ({
      id: a.author?.id,
      display_name: a.author?.display_name
    })) || [];

    const relatedInstitutions = [];
    const seenInstitutions = new Set<string>();
    
    if (rawWorkJson?.authorships) {
      for (const authorship of rawWorkJson.authorships) {
        if (authorship.institutions) {
          for (const inst of authorship.institutions) {
            if (!seenInstitutions.has(inst.id)) {
              seenInstitutions.add(inst.id);
              relatedInstitutions.push({
                id: inst.id,
                display_name: inst.display_name
              });
            }
          }
        }
      }
    }

    return {
      citationCount: rawWorkJson?.cited_by_count || 0,
      concepts,
      relatedAuthors,
      relatedInstitutions,
      openAlexId: rawWorkJson?.id || ''
    };
  }
}
