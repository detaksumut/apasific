import { createClient } from '@supabase/supabase-js';

export interface ICitationProvider {
  getCitationCount(doi: string): Promise<number>;
  getProviderName(): string;
}

export class CrossrefCitationProvider implements ICitationProvider {
  public async getCitationCount(doi: string): Promise<number> {
    try {
      const email = 'admin@apasific.com';
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${email}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data?.message?.['is-referenced-by-count'] || 0;
    } catch {
      return 0;
    }
  }

  public getProviderName(): string {
    return 'crossref';
  }
}

export class OpenCitationProvider implements ICitationProvider {
  public async getCitationCount(doi: string): Promise<number> {
    try {
      const res = await fetch(`https://opencitations.net/index/coci/api/v1/citation-count/${encodeURIComponent(doi)}`);
      if (!res.ok) return 0;
      const data = await res.json();
      if (data && data[0] && data[0].count !== undefined) {
        return parseInt(data[0].count, 10);
      }
      return 0;
    } catch {
      return 0;
    }
  }

  public getProviderName(): string {
    return 'opencitations';
  }
}

export class CitationProviderFactory {
  public static getProviders(): ICitationProvider[] {
    return [
      new CrossrefCitationProvider(),
      new OpenCitationProvider()
    ];
  }
}

export class CitationIntelligenceService {
  private static getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Synchronizes citation counts for a submission from all active providers.
   * Saves records as time-series data to build historical growth charts.
   */
  public static async syncArticleCitations(submissionId: string): Promise<{ success: boolean; data: any[] }> {
    const supabase = this.getSupabaseAdmin();
    const results: any[] = [];

    try {
      // 1. Fetch DOI from submission
      const { data: sub } = await supabase
        .from('submissions')
        .select('doi')
        .eq('id', submissionId)
        .single();

      if (!sub || !sub.doi) {
        return { success: false, data: [] };
      }

      const providers = CitationProviderFactory.getProviders();

      // 2. Fetch citation counts from each provider
      for (const provider of providers) {
        const count = await provider.getCitationCount(sub.doi);
        
        // 3. Save as a new entry in the time-series tracker
        const { data: savedRecord, error: saveErr } = await supabase
          .from('article_citations_tracker')
          .insert({
            submission_id: submissionId,
            citation_count: count,
            source: provider.getProviderName(),
            checked_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!saveErr && savedRecord) {
          results.push(savedRecord);
        }
      }

      // 4. Trigger author metric recalculation
      const { data: subAuthor } = await supabase
        .from('submissions')
        .select('author_id')
        .eq('id', submissionId)
        .single();
      
      if (subAuthor?.author_id) {
        await this.updateAuthorMetrics(subAuthor.author_id);
      }

      return { success: true, data: results };
    } catch (e: any) {
      console.error('[CitationIntelligence] Sync failed:', e);
      return { success: false, data: [] };
    }
  }

  /**
   * Recalculates h-index, i10-index, and total citations for an author
   * based on all their published submissions on IAEP.
   */
  public static async updateAuthorMetrics(profileId: string): Promise<void> {
    const supabase = this.getSupabaseAdmin();

    try {
      // 1. Fetch all published submissions by this author
      const { data: subs } = await supabase
        .from('submissions')
        .select('id, doi')
        .eq('author_id', profileId)
        .eq('status', 'Published');

      if (!subs || subs.length === 0) return;

      const citationCounts: number[] = [];

      // 2. Get latest citation count for each submission
      for (const sub of subs) {
        const { data: tracker } = await supabase
          .from('article_citations_tracker')
          .select('citation_count')
          .eq('submission_id', sub.id)
          .order('checked_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        citationCounts.push(tracker?.citation_count || 0);
      }

      // Calculate Metrics
      const totalCitations = citationCounts.reduce((a, b) => a + b, 0);
      
      // Calculate i10-index (papers with >= 10 citations)
      const i10Index = citationCounts.filter(c => c >= 10).length;

      // Calculate h-index (h papers with >= h citations)
      citationCounts.sort((a, b) => b - a); // sort descending
      let hIndex = 0;
      for (let i = 0; i < citationCounts.length; i++) {
        if (citationCounts[i] >= i + 1) {
          hIndex = i + 1;
        } else {
          break;
        }
      }

      // 3. Update active author metrics
      await supabase
        .from('author_academic_metrics')
        .upsert({
          profile_id: profileId,
          h_index: hIndex,
          i10_index: i10Index,
          total_citations: totalCitations,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' });

      // 4. Save to metrics history for historical year
      const currentYear = new Date().getFullYear();
      await supabase
        .from('author_metrics_history')
        .upsert({
          profile_id: profileId,
          h_index: hIndex,
          i10_index: i10Index,
          total_citations: totalCitations,
          recorded_year: currentYear,
          recorded_at: new Date().toISOString()
        }, { onConflict: 'profile_id, recorded_year' });

    } catch (err) {
      console.warn('[CitationIntelligence] Failed recalculating author metrics:', err);
    }
  }
}
