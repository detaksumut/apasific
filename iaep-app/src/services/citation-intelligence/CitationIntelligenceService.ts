// src/services/citation-intelligence/CitationIntelligenceService.ts

import { OpenAlexProvider } from '../../providers/openalex/OpenAlexProvider';
import { CitationMetricsMapper } from './CitationMetricsMapper';
import { createClient } from '@supabase/supabase-js';

export class CitationIntelligenceService {
  private openAlexProvider: OpenAlexProvider;
  private supabase: any;

  constructor() {
    this.openAlexProvider = new OpenAlexProvider();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  public async syncPublicationCitations(submissionId: string): Promise<any> {
    try {
      // 1. Get submission details (specifically the DOI and author_id)
      const { data: sub, error: subError } = await this.supabase
        .from('submissions')
        .select('id, doi, author_id')
        .eq('id', submissionId)
        .single();

      if (subError || !sub) throw new Error(subError?.message || 'Submission not found');
      if (!sub.doi) throw new Error('Submission has no associated DOI');

      // 2. Fetch citation metrics from OpenAlex Provider
      const snapshot = await this.openAlexProvider.fetchCitationCount(sub.doi);
      const metrics = CitationMetricsMapper.mapToMetrics(snapshot);

      // 3. Update the submissions citation field
      await this.supabase
        .from('submissions')
        .update({
          scopus_citations: metrics.citationCount // Map OpenAlex count directly for metrics tracking
        })
        .eq('id', submissionId);

      // 4. Save historical metrics to research_metrics
      if (sub.author_id) {
        // Resolve researcher identity for this author profile
        const { data: researcher } = await this.supabase
          .from('researcher_identities')
          .select('id')
          .eq('user_id', sub.author_id)
          .maybeSingle();

        if (researcher) {
          // Insert historical metric
          await this.supabase
            .from('research_metrics')
            .insert({
              researcher_id: researcher.id,
              metric_type: 'CITATIONS',
              value: metrics.citationCount,
              provider: metrics.sourceProvider
            });

          // Refresh researcher aggregated impact profile
          await this.refreshResearcherImpactProfile(researcher.id);
        }
      }

      return metrics;
    } catch (e) {
      console.error(`Failed to sync citations for submission ${submissionId}:`, e);
      throw e;
    }
  }

  /**
   * Recalculates and updates the researcher_impact_profiles snapshot.
   */
  public async refreshResearcherImpactProfile(researcherId: string): Promise<void> {
    try {
      // Fetch all publications for this researcher
      const { data: pubAuthors } = await this.supabase
        .from('publication_authors')
        .select('publication_id')
        .eq('researcher_id', researcherId);

      const pubIds = (pubAuthors || []).map((pa: any) => pa.publication_id);

      // Retrieve all submission ids related to these publications
      let totalCitations = 0;
      if (pubIds.length > 0) {
        const { data: publications } = await this.supabase
          .from('publications')
          .select('submission_id')
          .in('id', pubIds);

        const subIds = (publications || []).map((p: any) => p.submission_id).filter(Boolean);

        if (subIds.length > 0) {
          const { data: submissions } = await this.supabase
            .from('submissions')
            .select('scopus_citations')
            .in('id', subIds);

          totalCitations = (submissions || []).reduce((acc: number, s: any) => acc + (s.scopus_citations || 0), 0);
        }
      }

      // Calculate a mock h-index for demo purposes based on citation count
      const calculatedHIndex = Math.floor(Math.sqrt(totalCitations));

      // Upsert into researcher_impact_profiles
      await this.supabase
        .from('researcher_impact_profiles')
        .upsert({
          researcher_id: researcherId,
          citation_count: totalCitations,
          h_index: calculatedHIndex,
          i10_index: Math.floor(calculatedHIndex * 1.5),
          publication_count: pubIds.length,
          source_provider: 'OPENALEX',
          last_calculated_at: new Date().toISOString()
        }, { onConflict: 'researcher_id, source_provider' });

    } catch (e) {
      console.error(`Failed to refresh impact profile for researcher ${researcherId}:`, e);
    }
  }
}
