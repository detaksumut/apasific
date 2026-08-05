/**
 * ============================================================================
 * MIGRATION NOTE (IAEP Governance Change) — READ BEFORE USING.
 *
 * OLD MODEL: "AI Reviewer"
 *   - AI was modelled as an independent advisory reviewer that wrote a
 *     standalone report with reviewer_type='AI' in review_assignments.
 *
 * NEW MODEL: "AI-Assisted Review Enhancement Layer"
 *   - AI is NOT a reviewer. AI does NOT perform independent peer review and
 *     does NOT make editorial decisions.
 *   - AI only enhances a COMPLETED HUMAN REVIEWER REPORT.
 *   - Enhancement records live in `review_enhancements`
 *     (supabase/migrations/20260926000000_create_review_enhancements.sql).
 *   - The replacement service is `AIReviewEnhancementService` and the
 *     replacement server actions live in `src/app/actions/reviewEnhancement.ts`.
 *
 * THIS FILE IS SUPERSEDED. It is retained ONLY to preserve architecture
 * history and to keep the deprecated admin settings page compiling. It must
 * NOT be used for new review flows. Do not wire it into the editor submission
 * panel; use AIReviewEnhancementService instead.
 * ============================================================================
 *
 * (Original implementation retained for history.)
 *
 * AIReviewerService — Governed AI Reviewer Agent (Target #3).
 *
 * Tata kelola (governance) yang DIJAMIN oleh service ini:
 *
 *  1. Konfigurasi AI Reviewer (enabled + mode) HANYA dapat diubah oleh
 *     SUPER_ADMIN. Role dinormalisasi memakai `normalizeRole()` dari
 *     RBAC inti yang sudah ada — tidak ada modifikasi RBAC core.
 *
 *  2. AI Reviewer TIDAK BOLEH:
 *       - menerima/menolak naskah (accept/reject),
 *       - melewati editor (bypass editor),
 *       - mengubah status submission secara langsung.
 *     Implementasinya struktural: service ini TIDAK PERNAH menulis ke tabel
 *     `submissions` dan TIDAK PERNAH memanggil
 *     `SubmissionLifecycleService.transitionTo()`. Satu-satunya tabel yang
 *     ditulis adalah `review_assignments` (model laporan review yang sama
 *     dengan reviewer manusia) + `submission_activity_log` (audit trail).
 *
 *  3. Keluaran AI Reviewer bersifat ADVISORY: review report, score,
 *     comments, dan recommendation disimpan memakai kosakata rekomendasi
 *     reviewer yang sudah ada ('accept', 'minor_revision', 'major_revision',
 *     'resubmit', 'reject') — keputusan akhir tetap milik Editor melalui
 *     `recordEditorialDecision` (lifecycle gate tidak berubah).
 *
 *  4. Workflow reviewer manusia tidak diubah: assignment HUMAN tetap lewat
 *     `assignReviewer()` seperti biasa; AI memakai jalur sendiri dengan
 *     `reviewer_type = 'AI'`.
 */
import { normalizeRole, isCoAdminRole } from '@/lib/roles';
import { isCoAdmin, isEditorOrAbove } from '@/lib/permissions';
import { parseAbstractEnvelope } from './ReviewerMatchingService';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Mode operasi AI Reviewer yang dikendalikan Super Admin. */
export type AIReviewerMode = 'disabled' | 'optional' | 'mandatory';

/** Tipe penugasan reviewer pada review_assignments. */
export type ReviewerAssignmentType = 'HUMAN' | 'AI';

export const REVIEWER_TYPE: Record<'HUMAN' | 'AI', ReviewerAssignmentType> = {
    HUMAN: 'HUMAN',
    AI: 'AI',
};

export interface AIReviewerConfig {
    enabled: boolean;
    mode: AIReviewerMode;
    updatedAt?: string | null;
    updatedBy?: string | null;
}

export const AI_REVIEWER_CONFIG_KEY = 'ai_reviewer_config';

export const DEFAULT_AI_REVIEWER_CONFIG: AIReviewerConfig = {
    enabled: false,
    mode: 'disabled',
};

/** Identitas sentinel untuk baris assignment AI (tanpa profil pengguna). */
export const AI_REVIEWER_IDENTITY = {
    name: 'AI Reviewer Agent',
    email: 'ai-reviewer@apasific.org',
};

/** Kosakata rekomendasi yang valid (sama dengan reviewer manusia). */
export const AI_RECOMMENDATION_VOCABULARY = [
    'accept',
    'minor_revision',
    'major_revision',
    'resubmit',
    'reject',
] as const;
export type AIRecommendation = (typeof AI_RECOMMENDATION_VOCABULARY)[number];

export interface AIReviewComment {
    severity: 'info' | 'minor' | 'major';
    dimension: string;
    comment: string;
}

export interface AIReviewOutput {
    /** Skor keseluruhan 0–100. */
    overallScore: number;
    /** Skor per dimensi 0–100. */
    dimensionScores: Record<string, number>;
    comments: AIReviewComment[];
    /** Rekomendasi ADVISORY — bukan keputusan editorial. */
    recommendation: AIRecommendation;
    /** Laporan review lengkap (markdown). */
    report: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const VALID_MODES: AIReviewerMode[] = ['disabled', 'optional', 'mandatory'];

function safeString(v: any): string {
    if (typeof v === 'string') return v;
    if (v && typeof v === 'object') {
        // envelope {id, en}
        return [v.id, v.en].filter(t => typeof t === 'string').join('\n');
    }
    return '';
}

// ─── Service ───────────────────────────────────────────────────────────────

export class AIReviewerService {
// ── Role gates (pure, unit-testable) ───────────────────────────────────

    /**
     * Hanya SUPER_ADMIN (atau ADMIN yang dipetakan sebagai administrator
     * master) yang boleh mengelola konfigurasi AI Reviewer.
     *
     * Normalisasi memakai `normalizeRole()` dari RBAC inti sebagai single
     * source of truth (bukan sistem role baru). Status Super Admin login
     * dipetakan ke role 'admin'/'superadmin'/'super_admin' yang seluruhnya
     * dinormalisasi menjadi SUPER_ADMIN atau ADMIN.
     */
static canManageConfig(actorRole: string | null | undefined): boolean {
        const normalized = normalizeRole(actorRole);
        // Co-admin menormalkan ke ADMIN untuk RBAC, tetapi TIDAK boleh
        // mengelola konfigurasi AI Reviewer (tetap read-only).
        if (isCoAdminRole(actorRole)) return false;
        return normalized === 'SUPER_ADMIN' || normalized === 'ADMIN';
    }

    /**
     * Editor ke atas (termasuk co-admin yang boleh menugaskan reviewer)
     * boleh membaca konfigurasi dan menjalankan AI review.
     */
    static canRunAIReview(actorRole: string | null | undefined): boolean {
        const r = actorRole || '';
        return isEditorOrAbove(r) || isCoAdmin(r);
    }

    /** True bila AI Reviewer aktif (enabled DAN mode bukan disabled). */
    static isAIReviewerActive(config: AIReviewerConfig): boolean {
        return Boolean(config?.enabled) && config?.mode !== 'disabled';
    }

    // ── Configuration (system_settings) ────────────────────────────────────

    /**
     * Baca konfigurasi AI Reviewer dari `system_settings`.
     * Selalu mengembalikan konfigurasi valid (fallback default + sanitasi).
     */
static async getConfig(client: any): Promise<AIReviewerConfig> {
        try {
            const { data, error } = await client
                .from('system_settings')
                .select('value')
                .eq('key', AI_REVIEWER_CONFIG_KEY)
                .maybeSingle();

            // Defensive: if `.maybeSingle()` errors or returns multiple rows
            // (e.g. legacy duplicate rows), fall back to the first matching
            // row instead of silently returning the default config.
            if (error || !data || data.value === null || data.value === undefined) {
                const { data: rows, error: rowsErr } = await client
                    .from('system_settings')
                    .select('value')
                    .eq('key', AI_REVIEWER_CONFIG_KEY)
                    .limit(1)
                    .maybeSingle();
                if (rowsErr || !rows || rows.value === null || rows.value === undefined) {
                    return { ...DEFAULT_AI_REVIEWER_CONFIG };
                }
                const parsedRows = typeof rows.value === 'string'
                    ? (() => { try { return JSON.parse(rows.value); } catch { return null; } })()
                    : rows.value;
                return this.sanitizeConfig(parsedRows);
            }

            const parsed = typeof data.value === 'string'
                ? (() => { try { return JSON.parse(data.value); } catch { return null; } })()
                : data.value;
            return this.sanitizeConfig(parsed);
        } catch (e) {
            console.warn('[AIReviewerService] getConfig gagal, memakai default:', e);
            return { ...DEFAULT_AI_REVIEWER_CONFIG };
        }
    }

    /** Sanitize a raw parsed config value into a valid AIReviewerConfig. */
    private static sanitizeConfig(parsed: any): AIReviewerConfig {
        if (!parsed || typeof parsed !== 'object') {
            return { ...DEFAULT_AI_REVIEWER_CONFIG };
        }
        const mode: AIReviewerMode = VALID_MODES.includes(parsed.mode)
            ? parsed.mode
            : 'disabled';
        const enabled = parsed.enabled === true && mode !== 'disabled';
        return {
            enabled,
            mode,
            updatedAt: typeof parsed.updated_at === 'string' ? parsed.updated_at : null,
            updatedBy: typeof parsed.updated_by === 'string' ? parsed.updated_by : null,
        };
    }

    /**
     * Perbarui konfigurasi AI Reviewer. HANYA SUPER_ADMIN.
     * Gate dilakukan di layer service agar teruji secara unit.
     */
    static async updateConfig(
        client: any,
        input: { enabled: boolean; mode: string },
        actor: { id: string | null; role: string | null }
    ): Promise<{ success: boolean; config?: AIReviewerConfig; error?: string }> {
        if (!this.canManageConfig(actor.role)) {
            return {
                success: false,
                error: 'Akses ditolak: hanya SUPER_ADMIN yang dapat mengubah pengaturan AI Reviewer.',
            };
        }

        const enabled = input.enabled === true;
        const mode = VALID_MODES.includes(input.mode as AIReviewerMode)
            ? (input.mode as AIReviewerMode)
            : null;
        if (!mode) {
            return { success: false, error: 'Mode AI Reviewer tidak valid (disabled | optional | mandatory).' };
        }

        const config: AIReviewerConfig = {
            // mode disabled selalu berarti nonaktif, apa pun toggle enabled
            enabled: mode === 'disabled' ? false : enabled,
            mode,
            updatedAt: new Date().toISOString(),
            updatedBy: actor.id || null,
        };

        const payload = {
            enabled: config.enabled,
            mode: config.mode,
            updated_at: config.updatedAt,
            updated_by: config.updatedBy,
        };

const { error } = await client
            .from('system_settings')
            .upsert({ key: AI_REVIEWER_CONFIG_KEY, value: JSON.stringify(payload) }, { onConflict: 'key' });

        if (error) {
            return { success: false, error: 'Gagal menyimpan konfigurasi: ' + error.message };
        }
        return { success: true, config };
    }

    // ── Analysis engine (deterministic, pure) ──────────────────────────────

    /**
     * Analisis heuristik deterministik terhadap metadata naskah.
     * Menghasilkan: report, score, comments, recommendation (advisory).
     */
    static analyzeSubmission(submission: {
        title?: string | null;
        abstract?: string | null;
        keywords?: string[] | null;
        journal_name?: string | null;
    }): AIReviewOutput {
        const title = safeString(submission.title || '').trim();
        const envelope = parseAbstractEnvelope(safeString(submission.abstract || ''));
        const abstractText = envelope.abstractText.trim();
        const keywords = (envelope.keywords && envelope.keywords.length > 0)
            ? envelope.keywords
            : (Array.isArray(submission.keywords) ? submission.keywords.map(k => String(k)) : []);

        const lowerAbs = abstractText.toLowerCase();
        const absWords = abstractText.split(/\s+/).filter(Boolean);

        const dimensionScores: Record<string, number> = {};
        const comments: AIReviewComment[] = [];

        // 1. Kelengkapan metadata (25%)
        let completeness = 0;
        if (title.length >= 10) completeness += 35;
        else comments.push({ severity: 'major', dimension: 'Kelengkapan', comment: 'Judul naskah terlalu pendek atau kosong — judul harus deskriptif (minimal 10 karakter).' });
        if (abstractText.length >= 120) completeness += 40;
        else comments.push({ severity: 'major', dimension: 'Kelengkapan', comment: 'Abstrak kosong atau terlalu pendek (<120 karakter) — abstrak harus merangkum keseluruhan studi.' });
        if (keywords.length > 0) completeness += 25;
        else comments.push({ severity: 'minor', dimension: 'Kelengkapan', comment: 'Kata kunci tidak ditemukan — tambahkan 3–6 kata kunci untuk keterindeksan.' });
        dimensionScores.completeness = Math.min(100, completeness);

        // 2. Struktur abstrak: tujuan/metode/hasil/kesimpulan (20%)
        const structureSignals: Array<{ re: RegExp; label: string }> = [
            { re: /(tujuan|penelitian ini bertujuan|purpose|aim of|objective)/, label: 'tujuan penelitian' },
            { re: /(metode|method|pendekatan|approach|design)/, label: 'metode' },
            { re: /(hasil|result|temuan|finding)/, label: 'hasil' },
            { re: /(kesimpulan|conclusion|disimpulkan|recommend)/, label: 'kesimpulan' },
        ];
        let structure = 0;
        for (const sig of structureSignals) {
            if (sig.re.test(lowerAbs)) structure += 25;
            else comments.push({ severity: 'minor', dimension: 'Struktur', comment: `Abstrak belum memuat unsur ${sig.label} secara eksplisit.` });
        }
        dimensionScores.structure = Math.min(100, structure);

        // 3. Kejelasan (panjang abstrak ideal) (20%)
        const wc = absWords.length;
        let clarity = 0;
        if (wc >= 80 && wc <= 350) clarity = 100;
        else if ((wc >= 40 && wc < 80) || (wc > 350 && wc <= 500)) clarity = 60;
        else clarity = wc > 0 ? 25 : 0;
        if (clarity < 100) {
            comments.push({ severity: clarity <= 60 ? 'minor' : 'major', dimension: 'Kejelasan', comment: `Panjang abstrak ${wc} kata — rentang ideal 80–350 kata.` });
        }
        dimensionScores.clarity = clarity;

        // 4. Kualitas kata kunci (15%)
        let kwScore = 0;
        if (keywords.length >= 3 && keywords.length <= 6) kwScore += 60;
        else if (keywords.length > 0) kwScore += 30;
        const titleTokens = new Set(title.toLowerCase().split(/[^a-z0-9]+/).filter(t => t.length > 3));
        const overlap = keywords.filter(k => titleTokens.has(k.toLowerCase().trim())).length;
        if (overlap > 0) kwScore += Math.min(40, overlap * 20);
        dimensionScores.keywords_quality = Math.min(100, kwScore);
        if (kwScore < 60) {
            comments.push({ severity: 'minor', dimension: 'Kata Kunci', comment: 'Kata kunci sebaiknya 3–6 frasa dan selaras dengan judul untuk meningkatkan keterindeksan.' });
        }

        // 5. Sinyal ilmiah (metodologi/analisis/data) (20%)
        const scholarlyTerms = [
            /analisis|analysis/, /penelitian|study|research/, /data/,
            /framework|kerangka/, /model/, /evaluasi|evaluation/,
            /referensi|reference|daftar pustaka/, /hipotesis|hypothesis/,
            /validasi|validation/, /signifikan|significant/,
        ];
        let hits = 0;
        for (const t of scholarlyTerms) {
            if (t.test(lowerAbs) || t.test(title.toLowerCase())) hits += 1;
        }
        const scholarly = Math.min(100, hits * 15);
        dimensionScores.scholarly_signals = scholarly;
        if (scholarly < 45) {
            comments.push({ severity: 'minor', dimension: 'Sinyal Ilmiah', comment: 'Abstrak minim istilah metodologis/analitis — pertegas pendekatan ilmiah yang digunakan.' });
        }

        // Skor keseluruhan (berbobot)
        const overallScore = Math.round(
            dimensionScores.completeness * 0.25 +
            dimensionScores.structure * 0.20 +
            dimensionScores.clarity * 0.20 +
            dimensionScores.keywords_quality * 0.15 +
            dimensionScores.scholarly_signals * 0.20
        );

        // Pemetaan rekomendasi (ADVISORY — keputusan tetap milik Editor)
        let recommendation: AIRecommendation;
        if (overallScore >= 80) recommendation = 'accept';
        else if (overallScore >= 65) recommendation = 'minor_revision';
        else if (overallScore >= 50) recommendation = 'major_revision';
        else if (overallScore >= 30) recommendation = 'resubmit';
        else recommendation = 'reject';

        if (comments.length === 0) {
            comments.push({ severity: 'info', dimension: 'Umum', comment: 'Tidak ditemukan isu mayor pada metadata naskah. Penilaian substansi penuh tetap memerlukan reviewer manusia.' });
        }

        const report = this.buildReport(submission, overallScore, dimensionScores, comments, recommendation);
        return { overallScore, dimensionScores, comments, recommendation, report };
    }

    /** Susun laporan review markdown (disclaimer advisory selalu disertakan). */
    private static buildReport(
        submission: any,
        overallScore: number,
        dimensionScores: Record<string, number>,
        comments: AIReviewComment[],
        recommendation: AIRecommendation
    ): string {
        const recLabel: Record<AIRecommendation, string> = {
            accept: 'Terima (Accept)',
            minor_revision: 'Revisi Minor',
            major_revision: 'Revisi Mayor',
            resubmit: 'Kirim Ulang (Resubmit)',
            reject: 'Tolak (Reject)',
        };
        const dimLabels: Record<string, string> = {
            completeness: 'Kelengkapan Metadata',
            structure: 'Struktur Abstrak',
            clarity: 'Kejelasan',
            keywords_quality: 'Kualitas Kata Kunci',
            scholarly_signals: 'Sinyal Ilmiah',
        };
        const dimRows = Object.entries(dimensionScores)
            .map(([k, v]) => `  - ${dimLabels[k] || k}: ${v}/100`)
            .join('\n');
        const commentRows = comments
            .map((c, i) => `${i + 1}. [${c.severity.toUpperCase()}] (${c.dimension}) ${c.comment}`)
            .join('\n');
        const title = safeString(submission?.title || '').trim() || '(tanpa judul)';

        return [
            '# Laporan Review AI (Advisory)',
            '',
            `Naskah: ${title}`,
            '',
            '> **Disclaimer**: Laporan ini dihasilkan oleh Governed AI Reviewer Agent berdasarkan',
            '> analisis heuristik metadata naskah. Rekomendasi bersifat PENASIHAT (advisory) dan',
            '> TIDAK menggantikan keputusan editorial. Keputusan akhir (accept/reject) tetap',
            '> berada di tangan Editor melalui mekanisme lifecycle yang berlaku.',
            '',
            `**Skor Keseluruhan: ${overallScore}/100**`,
            `**Rekomendasi: ${recLabel[recommendation]}**`,
            '',
            '## Skor per Dimensi',
            dimRows,
            '',
            '## Catatan untuk Penulis',
            commentRows,
            '',
            '## Batasan Review AI',
            '- Review ini tidak mengubah status naskah.',
            '- Review ini tidak melewati editor.',
            '- Hasil akhir ditentukan oleh Editor berdasarkan review manusia dan AI.',
        ].join('\n');
    }

    // ── Review generation (governed write path) ────────────────────────────

    /**
     * Cari baris assignment AI untuk sebuah naskah (bila sudah ada).
     * Filter dilakukan di JS agar tetap berfungsi pada database yang belum
     * menerapkan kolom `reviewer_type`.
     */
    static async getAIAssignment(client: any, submissionId: string): Promise<any | null> {
        const { data } = await client
            .from('review_assignments')
            .select('*')
            .eq('submission_id', submissionId);

        const rows: any[] = Array.isArray(data) ? data : [];
        const aiRows = rows.filter(r =>
            (r.reviewer_type === 'AI') ||
            ((r.reviewer_email || '').toLowerCase() === AI_REVIEWER_IDENTITY.email)
        );
        if (aiRows.length === 0) return null;
        // Ambil yang paling baru
        aiRows.sort((a, b) => String(b.assigned_at || '').localeCompare(String(a.assigned_at || '')));
        return aiRows[0];
    }

    /**
     * Jalankan AI review untuk sebuah naskah:
     *   1. Validasi konfigurasi (enabled + mode).
     *   2. Baca naskah (READ-ONLY — tidak ada penulisan ke `submissions`).
     *   3. Analisis deterministik → report/score/comments/recommendation.
     *   4. Simpan sebagai baris `review_assignments` dengan reviewer_type 'AI'
     *      (update bila sudah ada, agar tidak duplikat).
     *   5. Catat audit trail di `submission_activity_log`.
     *
     * GARANSI GOVERNANCE: fungsi ini tidak pernah menulis tabel `submissions`
     * dan tidak pernah memanggil SubmissionLifecycleService.
     */
    static async generateReview(
        client: any,
        submissionId: string,
        actor: { id: string | null; role: string | null }
    ): Promise<{ success: boolean; assignmentId?: string; review?: AIReviewOutput; error?: string }> {
        // 1. Gate konfigurasi
        const config = await this.getConfig(client);
        if (!this.isAIReviewerActive(config)) {
            return {
                success: false,
                error: 'AI Reviewer tidak aktif. Aktifkan melalui pengaturan Super Admin (mode optional/mandatory).',
            };
        }

        if (!submissionId) {
            return { success: false, error: 'submissionId wajib diisi.' };
        }

        // 2. Baca naskah (READ-ONLY)
        const { data: submission, error: subErr } = await client
            .from('submissions')
            .select('id, title, abstract, keywords, journal_name')
            .eq('id', submissionId)
            .maybeSingle();
        if (subErr) return { success: false, error: 'Gagal membaca naskah: ' + subErr.message };
        if (!submission) return { success: false, error: 'Naskah tidak ditemukan.' };

        // 3. Analisis deterministik
        const review = this.analyzeSubmission(submission);

        // 4. Simpan ke model laporan review (review_assignments)
        const nowIso = new Date().toISOString();
        const commentsForAuthor = review.comments
            .map((c, i) => `${i + 1}. [${c.dimension}] ${c.comment}`)
            .join('\n');

        const payload: Record<string, any> = {
            submission_id: submissionId,
            reviewer_id: null, // AI agent tidak memiliki profil pengguna
            reviewer_email: AI_REVIEWER_IDENTITY.email,
            reviewer_name: AI_REVIEWER_IDENTITY.name,
            reviewer_type: REVIEWER_TYPE.AI,
            status: 'completed', // AI tidak perlu accept/decline penugasan
            assigned_at: nowIso,
            completed_at: nowIso,
            updated_at: nowIso,
            recommendation: review.recommendation,
            comments_for_editor: review.report,
            comments_for_author: commentsForAuthor,
            score: {
                overall: review.overallScore,
                dimensions: review.dimensionScores,
                generated_by: 'AIReviewerService',
            },
            assigned_by: actor.id || null,
            role_assigner: actor.role || null,
        };

        const existing = await this.getAIAssignment(client, submissionId);
        let assignmentId: string;

        if (existing && existing.id) {
            const { error: upErr } = await client
                .from('review_assignments')
                .update(payload)
                .eq('id', existing.id);
            if (upErr) return { success: false, error: 'Gagal memperbarui review AI: ' + upErr.message };
            assignmentId = existing.id;
        } else {
            let { data: inserted, error: insErr } = await client
                .from('review_assignments')
                .insert(payload)
                .select('id')
                .single();

            // Fallback defensif: DB yang belum menerapkan migrasi
            // (kolom reviewer_type belum ada) → coba lagi tanpa kolom itu.
            if (insErr && /reviewer_type|column/i.test(insErr.message || '')) {
                const fallbackPayload = { ...payload };
                delete fallbackPayload.reviewer_type;
                const retry = await client
                    .from('review_assignments')
                    .insert(fallbackPayload)
                    .select('id')
                    .single();
                inserted = retry.data;
                insErr = retry.error;
            }
            if (insErr) return { success: false, error: 'Gagal menyimpan review AI: ' + insErr.message };
            assignmentId = inserted?.id;
        }

        // 5. Audit trail (non-fatal)
        try {
            await client.from('submission_activity_log').insert({
                submission_id: submissionId,
                actor_id: actor.id || null,
                actor_role: actor.role || null,
                action: 'AI_REVIEW_GENERATED',
                details: {
                    recommendation: review.recommendation,
                    overall_score: review.overallScore,
                    mode: config.mode,
                },
            });
        } catch (e) { /* non-fatal */ }

        return { success: true, assignmentId, review };
    }
}

export default AIReviewerService;