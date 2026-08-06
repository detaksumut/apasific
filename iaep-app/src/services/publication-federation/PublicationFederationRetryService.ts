import { createClient } from '@supabase/supabase-js';
import { PublicationFederationOrchestrator } from './PublicationFederationOrchestrator';

export class PublicationFederationRetryService {
  private static getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Retries all failed provider registrations for a given submission.
   * Safe execution:
   *   - Bypasses any provider that is already 'COMPLETED'.
   *   - Ignores 'FAILED_PERMANENT' status unless forceRetry is set to true (Admin override).
   *   - Resets status to 'PENDING' to allow the orchestrator to pick it up again.
   */
  public static async retryFailedProviders(
    submissionId: string,
    actorId: string | null = null,
    forceRetryPermanent: boolean = false
  ): Promise<{ success: boolean; message: string; retriedProviders: string[] }> {
    const supabase = this.getSupabaseAdmin();
    const retriedProviders: string[] = [];

    try {
      // 1. Fetch registry records for this submission
      const { data: registry, error: fetchErr } = await supabase
        .from('publication_provider_registry')
        .select('*')
        .eq('submission_id', submissionId);

      if (fetchErr) throw fetchErr;
      if (!registry || registry.length === 0) {
        return { success: false, message: 'Tidak ada registry provider ditemukan untuk naskah ini.', retriedProviders };
      }

      // 2. Identify candidate providers for retry
      for (const reg of registry) {
        const isFailed = reg.status === 'FAILED';
        const isFailedPermanent = reg.status === 'FAILED_PERMANENT';

        // Only retry failed ones. FAILED_PERMANENT needs explicit forceRetry (Admin override)
        if (isFailed || (isFailedPermanent && forceRetryPermanent)) {
          // Reset status to PENDING and clear error message to allow retry run
          const { error: updateErr } = await supabase
            .from('publication_provider_registry')
            .update({
              status: 'PENDING',
              error_message: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', reg.id);

          if (updateErr) {
            console.error(`[FederationRetry] Failed to reset provider status for ${reg.provider_name}:`, updateErr);
            continue;
          }

          retriedProviders.push(reg.provider_name);
        }
      }

      if (retriedProviders.length === 0) {
        return { 
          success: true, 
          message: 'Semua provider sudah sukses atau berstatus FAILED_PERMANENT (tanpa force override). Tidak ada yang dicoba ulang.', 
          retriedProviders 
        };
      }

      // 3. Trigger orchestrator to execute the PENDING syncs
      const orchestrator = new PublicationFederationOrchestrator();
      const outcome = await orchestrator.processPublication(submissionId, {}, {
        actionType: 'RETRY_FAILED',
        actorId
      });

      if (!outcome.success) {
        return { 
          success: false, 
          message: `Proses retry dijalankan, namun orkestrator gagal: ${outcome.error || 'Unknown error'}`, 
          retriedProviders 
        };
      }

      return { 
        success: true, 
        message: `Berhasil memicu coba ulang untuk provider: ${retriedProviders.join(', ')}.`, 
        retriedProviders 
      };
    } catch (e: any) {
      console.error('[FederationRetry] Retry process failed:', e);
      return { success: false, message: `Gagal menjalankan retry: ${e.message || e}`, retriedProviders };
    }
  }
}
