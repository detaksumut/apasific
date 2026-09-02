/**
 * LoAService — Persistent Letter of Acceptance record management.
 *
 * Responsibilities:
 * 1. Create LoA record after "Editor Decision: Accepted" (idempotent).
 * 2. Read LoA record for print pages.
 * 3. Backfill LoA records for existing accepted submissions.
 *
 * accepted_at source: submission_history.created_at
 * where action = 'Editor Decision: Accepted'
 */
export interface LoARecord {
    id: string;
    submission_id: string;
    loa_number: string;
    accepted_at: string;
    created_at: string;
    updated_at: string;
}

export interface CreateLoAResult {
    success: boolean;
    record?: LoARecord;
    error?: string;
    alreadyExists?: boolean;
}

export class LoAService {

    /**
     * Ensure a persistent LoA record exists for the given submission.
     * Idempotent: returns existing record if one already exists.
     *
     * @param supabase  Supabase client (service-role recommended)
     * @param submissionId  The submission that was accepted
     */
    static async ensureLoARecord(
        supabase: any,
        submissionId: string
    ): Promise<CreateLoAResult> {
        // 1. Check if LoA record already exists (idempotency)
        const { data: existing } = await supabase
            .from('loa_records')
            .select('*')
            .eq('submission_id', submissionId)
            .maybeSingle();

        if (existing) {
            return { success: true, record: existing, alreadyExists: true };
        }

        // 2. Find the acceptance timestamp from submission_history
        const { data: historyEntry, error: histErr } = await supabase
            .from('submission_history')
            .select('created_at')
            .eq('submission_id', submissionId)
            .eq('action', 'Editor Decision: Accepted')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (histErr || !historyEntry) {
            console.warn(
                `[LoAService] Acceptance history not found for ${submissionId}. ` +
                `Cannot create LoA record without submission_history evidence.`
            );
            return {
                success: false,
                error: histErr?.message || 'Acceptance history (Editor Decision: Accepted) not found in submission_history.'
            };
        }

        const acceptedAt: string = historyEntry.created_at;

        // 3. Generate persistent LoA number from accepted_at year
        const loaNumber = await LoAService.generateLoANumber(supabase, submissionId, acceptedAt);

        // 4. Insert LoA record (UNIQUE constraint protects against duplicates)
        const { data: record, error: insertErr } = await supabase
            .from('loa_records')
            .insert({
                submission_id: submissionId,
                loa_number: loaNumber,
                accepted_at: acceptedAt,
            })
            .select()
            .maybeSingle();

        if (insertErr) {
            // Handle race condition: another process may have inserted first
            if (insertErr.code === '23505') {
                const { data: raceRecord } = await supabase
                    .from('loa_records')
                    .select('*')
                    .eq('submission_id', submissionId)
                    .maybeSingle();
                if (raceRecord) {
                    return { success: true, record: raceRecord, alreadyExists: true };
                }
            }
            console.error(`[LoAService] Failed to create LoA record for ${submissionId}:`, insertErr);
            return { success: false, error: insertErr.message };
        }

        return { success: true, record };
    }

    /**
     * Read the LoA record for a given submission.
     * Returns null if no record exists.
     */
    static async getLoARecord(
        supabase: any,
        submissionId: string
    ): Promise<LoARecord | null> {
        const { data } = await supabase
            .from('loa_records')
            .select('*')
            .eq('submission_id', submissionId)
            .maybeSingle();
        return data || null;
    }

    /**
     * Generate LoA number in format: {SUBMISSION_PREFIX}/LoA/APASIFIC/{YEAR}
     * YEAR is extracted from accepted_at (not current date).
     */
    static async generateLoANumber(
        supabase: any,
        submissionId: string,
        acceptedAt: string
    ): Promise<string> {
        const prefix = submissionId.split('-')[0].toUpperCase();
        const year = new Date(acceptedAt).getFullYear();
        return `${prefix}/LoA/APASIFIC/${year}`;
    }
}
