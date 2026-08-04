/**
 * SubmissionLifecycleService — SATU-SATUNYA gerbang (single gate) untuk
 * mengubah status/stage siklus hidup naskah (tabel `submissions`).
 *
 * Semua alur kerja (editor, reviewer, co-admin, produksi) WAJIB melewati
 * `transitionTo()` alih-alih menulis kolom `status`/`stage` secara langsung,
 * agar setiap perubahan divalidasi terhadap state machine di
 * `src/utils/SubmissionStateMachine.ts`.
 *
 * Perilaku:
 * 1. Membaca status/stage terkini naskah.
 * 2. Memvalidasi status & stage target terhadap kosakata domain.
 * 3. Memvalidasi transisi (menolak downgrade/terminal/unknown) kecuali `force`.
 * 4. Menyimpan perubahan + `updated_at`, opsi mirror legacy (`submission_id`),
 *    dan opsional insert `submission_history`.
 *
 * `force: true` disediakan HANYA untuk pemulihan administratif eksplisit
 * (contoh: tombol recovery supervisor produksi) dan selalu dicatat di log.
 */
import { isKnownSubmissionStage, isKnownSubmissionStatus } from '../domain/submission/SubmissionStatus';
import { validateTransition } from '../utils/SubmissionStateMachine';

export interface SubmissionTransitionInput {
    /** Status target (opsional jika hanya mengubah stage/extraFields). */
    status?: string;
    /** Stage target (opsional). */
    stage?: string;
    /** Kolom tambahan yang ikut disimpan (volume, issue, author, dsb). */
    extraFields?: Record<string, any>;
    /** ID aktor untuk submission_history.performed_by. */
    actorId?: string | null;
    /** Entri submission_history opsional yang dicatat setelah transisi sukses. */
    history?: { action: string; details?: string };
    /**
     * Mirror update ke baris legacy yang di-key dengan `submission_id`
     * (bukan `id`) — mempertahankan perilaku lama reviewer actions.
     */
    mirrorLegacySubmissionId?: boolean;
    /** Lewati validasi state machine (pemulihan admin). Gunakan dengan hati-hati. */
    force?: boolean;
    /** Alasan pemakaian `force` — dicatat ke log server. */
    reason?: string;
}

export interface SubmissionTransitionResult {
    success: boolean;
    error?: string;
    forced?: boolean;
    from?: { status: string | null; stage: string | null };
    to?: { status: string | null; stage: string | null };
}


export class SubmissionLifecycleService {
    /** Validasi transisi tanpa menyentuh database. */
    static validate = validateTransition;

    /**
     * Eksekusi transisi status/stage naskah melalui gerbang tervalidasi.
     *
     * @param supabase     Klien Supabase (service-role/admin atau session client).
     * @param submissionId ID baris pada kolom `submissions.id`.
     */
    static async transitionTo(
        supabase: any,
        submissionId: string,
        input: SubmissionTransitionInput
    ): Promise<SubmissionTransitionResult> {
        try {
            if (!submissionId) {
                return { success: false, error: 'submissionId kosong — transisi dibatalkan.' };
            }

            const wantsStatus = typeof input.status === 'string' && input.status.length > 0;
            const wantsStage = typeof input.stage === 'string' && input.stage.length > 0;

            if (!wantsStatus && !wantsStage && !input.extraFields) {
                return { success: false, error: 'Tidak ada perubahan status/stage yang diminta.' };
            }

            // 1. Baca kondisi terkini naskah
            const { data: current, error: fetchErr } = await supabase
                .from('submissions')
                .select('id, status, stage')
                .eq('id', submissionId)
                .maybeSingle();

            if (fetchErr) {
                return { success: false, error: `Gagal membaca status naskah: ${fetchErr.message}` };
            }
            if (!current) {
                // Baris tidak terlihat oleh klien ini (mis. dibatasi RLS pada
                // session client). Pertahankan perilaku lama: lanjutkan update
                // tanpa validasi status asal (status target tetap divalidasi).
                console.warn(
                    '[SubmissionLifecycle] baris naskah tidak terbaca oleh klien ini; ' +
                    'melanjutkan tanpa validasi status asal.'
                );
            }

            const fromStatus: string = current?.status || '';
            const toStatus: string = wantsStatus ? (input.status as string) : fromStatus;
            const toStage: string | null = wantsStage ? (input.stage as string) : (current?.stage || null);

            // 2. Validasi state machine
            if (!input.force) {
                if (wantsStatus && !isKnownSubmissionStatus(toStatus)) {
                    return { success: false, error: `Status naskah tidak dikenal: "${toStatus}"` };
                }
                if (wantsStage && !isKnownSubmissionStage(toStage)) {
                    return { success: false, error: `Stage naskah tidak dikenal: "${toStage}"` };
                }
                if (wantsStatus) {
                    const check = validateTransition(fromStatus, toStatus);
                    if (!check.valid) {
                        return { success: false, error: check.reason || 'Transisi status tidak valid.' };
                    }
                }
            } else {
                console.warn(
                    `[SubmissionLifecycle] FORCE transition ${submissionId}: ` +
                    `"${fromStatus}" → "${toStatus}" (stage: "${toStage}") — ${input.reason || 'tanpa alasan'}`
                );
            }

            // 3. Simpan perubahan
            const payload: Record<string, any> = { ...(input.extraFields || {}), updated_at: new Date() };
            if (wantsStatus) payload.status = toStatus;
            if (wantsStage) payload.stage = toStage;

            const { error: updateErr } = await supabase
                .from('submissions')
                .update(payload)
                .eq('id', submissionId);

            if (updateErr) {
                return { success: false, error: `Gagal memperbarui naskah: ${updateErr.message}` };
            }

            // 4. Mirror legacy (baris duplikat yang di-key dengan submission_id) —
            //    replikasi payload penuh (status/stage/kolom tambahan) agar identik
            //    dengan perilaku dual-write lama.
            if (input.mirrorLegacySubmissionId) {
                try {
                    await supabase
                        .from('submissions')
                        .update(payload)
                        .eq('submission_id', submissionId);
                } catch (mirrorErr) {
                    console.warn('[SubmissionLifecycle] legacy mirror update gagal (non-fatal):', mirrorErr);
                }
            }

            // 5. Catat riwayat (non-fatal)
            if (input.history) {
                try {
                    await supabase.from('submission_history').insert({
                        submission_id: submissionId,
                        action: input.history.action,
                        performed_by: input.actorId ?? null,
                        details: input.history.details || null,
                    });
                } catch (histErr) {
                    console.warn('[SubmissionLifecycle] submission_history insert gagal (non-fatal):', histErr);
                }
            }

            return {
                success: true,
                forced: !!input.force,
                from: { status: fromStatus || null, stage: current?.stage || null },
                to: { status: toStatus || null, stage: toStage },
            };
        } catch (e: any) {
            console.error('[SubmissionLifecycle] transitionTo error:', e);
            return { success: false, error: e?.message || 'Kesalahan tidak dikenal pada transisi lifecycle.' };
        }
    }
}
