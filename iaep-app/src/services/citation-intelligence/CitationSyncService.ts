// src/services/citation-intelligence/CitationSyncService.ts

import { CitationIntelligenceService } from './CitationIntelligenceService';
import { createClient } from '@supabase/supabase-js';

export class CitationSyncService {
  private citationService: CitationIntelligenceService;
  private supabase: any;

  constructor() {
    this.citationService = new CitationIntelligenceService();
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
  }

  /**
   * Scans all published articles with DOIs and syncs their citation metrics.
   */
  public async syncAllActiveCitations(): Promise<{ success: boolean; syncedCount: number; errors: any[] }> {
    const errors: any[] = [];
    let syncedCount = 0;

    try {
      // Find all submissions with status 'Published' and non-empty doi
      const { data: publishedSubs, error } = await this.supabase
        .from('submissions')
        .select('id, doi')
        .eq('status', 'Published')
        .not('doi', 'is', null);

      if (error) throw error;

      const submissions = (publishedSubs || []).filter((s: any) => s.doi && s.doi.trim());

      for (const sub of submissions) {
        try {
          await this.citationService.syncPublicationCitations(sub.id);
          syncedCount++;
        } catch (e: any) {
          errors.push({
            submissionId: sub.id,
            doi: sub.doi,
            error: e.message || 'Unknown Error'
          });
        }
      }

      return {
        success: errors.length === 0,
        syncedCount,
        errors
      };

    } catch (e: any) {
      console.error("Failed to run bulk citation synchronization job:", e);
      return {
        success: false,
        syncedCount,
        errors: [{ message: e.message || 'Fatal Cron Job Failure' }]
      };
    }
  }
}
