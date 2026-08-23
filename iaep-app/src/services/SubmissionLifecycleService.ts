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
import { AsiaIndexService } from './asia-index/AsiaIndexService';
import { ASIACitationGraphService } from './asia-index/ASIACitationGraphService';

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

            // 6. Sinkronisasi Otomatis ke WordPress beritaindonesia.news (non-blocking)
            if (toStatus === 'Published') {
                setTimeout(async () => {
                    try {
                        const wpUrl = process.env.WORDPRESS_API_URL;
                        const wpUser = process.env.WORDPRESS_API_USER;
                        const wpPass = process.env.WORDPRESS_API_PASSWORD;

                        if (wpUrl && wpUser && wpPass) {
                            // Ambil data detail tulisan & relasi penulis dari article_authors
                            const { data: article } = await supabase
                                .from('submissions')
                                .select('*, article_authors(*)')
                                .eq('id', submissionId)
                                .maybeSingle();

                            if (article) {
                                const title = article.title || 'Untitled Article';
                                const abstract = article.abstract || '';
                                
                                const sortedAuthors = (article.article_authors || [])
                                    .sort((a: any, b: any) => (a.author_order || 0) - (b.author_order || 0))
                                    .map((a: any) => a.full_name)
                                    .join(', ');

                                const authorPrefix = sortedAuthors ? `<p><strong>Penulis:</strong> ${sortedAuthors}</p>` : (article.author ? `<p><strong>Penulis:</strong> ${article.author}</p>` : '');
                                const doiPrefix = article.doi ? `<p><strong>DOI:</strong> <a href="https://doi.org/${article.doi}" target="_blank" rel="noopener noreferrer">${article.doi}</a></p>` : '';
                                const journalPrefix = article.volume && article.issue ? `<p><strong>Terbitan:</strong> Volume ${article.volume}, Issue ${article.issue}</p>` : '';
                                
                                const apasificLink = `<div style="background: #f0f4f8; border-left: 4px solid #c9a84c; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: bold; color: #1e293b;">🌐 Akses Naskah &amp; Sertifikat Resmi:</p>
                                    <p style="margin: 0; font-size: 14px;"><a href="https://apasific.org/article/${submissionId}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: bold; text-decoration: underline;">https://apasific.org/article/${submissionId}</a></p>
                                </div>`;

                                const wpContent = `
                                    ${authorPrefix}
                                    ${doiPrefix}
                                    ${journalPrefix}
                                    ${apasificLink}
                                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;">
                                    <p><strong>Abstrak:</strong></p>
                                    <p style="text-align: justify; line-height: 1.7;">${abstract}</p>
                                    ${article.keywords ? `<p style="margin-top: 15px;"><strong>Kata Kunci:</strong> <em>${article.keywords}</em></p>` : ''}
                                `;

                                const authHeader = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
                                
                                let featuredMediaId: number | undefined = undefined;
                                if (article.cover_file_url) {
                                    try {
                                        let cleanCoverUrl = article.cover_file_url;
                                        if (cleanCoverUrl.includes('?token=')) {
                                            const path = cleanCoverUrl.split('/manuscripts/')[1].split('?')[0];
                                            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
                                            const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
                                            cleanCoverUrl = `${supabaseUrl}/storage/v1/object/authenticated/manuscripts/${path}`;
                                            const imgRes = await fetch(cleanCoverUrl, {
                                                headers: { 'Authorization': 'Bearer ' + supabaseKey }
                                            });
                                            const imgBuf = await imgRes.arrayBuffer();
                                            if (imgBuf.byteLength > 1000) {
                                                const mediaEndpoint = wpUrl.replace(/\/posts\/?$/, '/media');
                                                const uploadRes = await fetch(mediaEndpoint, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Authorization': authHeader,
                                                        'Content-Type': 'image/png',
                                                        'Content-Disposition': `attachment; filename=cover-${submissionId}.png`
                                                    },
                                                    body: Buffer.from(imgBuf)
                                                });
                                                const mediaData = await uploadRes.json();
                                                if (mediaData && mediaData.id) {
                                                    featuredMediaId = mediaData.id;
                                                }
                                            }
                                        }
                                    } catch (mediaErr) {
                                        console.warn('[WordPress Sync] Failed to upload featured media:', mediaErr);
                                    }
                                }

                                const wpPayload: any = {
                                    title: title,
                                    content: wpContent,
                                    status: 'publish', // Terbit langsung sebagai artikel/post berita
                                };
                                if (featuredMediaId) {
                                    wpPayload.featured_media = featuredMediaId;
                                }

                                const response = await fetch(wpUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': authHeader
                                    },
                                    body: JSON.stringify(wpPayload)
                                });

                                if (!response.ok) {
                                    const errText = await response.text();
                                    console.warn(`[WordPress Sync] Failed to post article ${submissionId} to WordPress: ${response.status} ${errText}`);
                                } else {
                                    console.log(`[WordPress Sync] Successfully syndicated article ${submissionId} to beritaindonesia.news (featured_media: ${featuredMediaId || 'none'})`);
                                }
                            }
                        }
                    } catch (syncErr) {
                        console.warn('[WordPress Sync] Error during article syndication:', syncErr);
                    }
                }, 100);
            }

            // 7. Registrasi Otomatis ke ASIA Index & Citation Graph Ingestion (non-blocking background)
            if (toStatus === 'Published') {
                setTimeout(async () => {
                    try {
                        await AsiaIndexService.resolveOrRegisterAsiaRecord(submissionId);
                        await ASIACitationGraphService.syncCitations(submissionId);
                        console.log(`[ASIA Index Hook] Successfully registered/resolved ASIA Record and Citation Graph for article ${submissionId}`);
                    } catch (asiaErr) {
                        console.warn('[ASIA Index Hook] Non-blocking ASIA registration/graph sync skipped:', asiaErr);
                    }
                }, 150);
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
