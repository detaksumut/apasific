/**
 * scratch/ai-reviewer-verify/verify.mjs
 *
 * Verifikasi offline Governed AI Reviewer (Target #3) — deterministik,
 * tanpa Supabase nyata. Membuktikan:
 *   A. Role gates: hanya SUPER_ADMIN boleh mengubah konfigurasi.
 *   B. updateConfig: ditolak untuk non-SUPER_ADMIN; mode invalid ditolak.
 *   C. getConfig: fallback default + parsing aman.
 *   D. analyzeSubmission: deterministik, skor & rekomendasi valid.
 *   E. generateReview: governance write path — menulis HANYA ke
 *      review_assignments (+ audit log), TIDAK PERNAH menulis `submissions`
 *      dan tidak menyentuh lifecycle.
 *
 * Build dulu (dari root repo):
 *   npx tsc src/services/reviewer/AIReviewerService.ts src/services/reviewer/ReviewerMatchingService.ts src/lib/roles.ts src/lib/permissions.ts --outDir scratch/ai-reviewer-verify/dist --target es2020 --module commonjs --skipLibCheck --esModuleInterop
 * Jalankan:
 *   node scratch/ai-reviewer-verify/verify.mjs
 */
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

// Hook require('@/...') → dist/... (path alias tsconfig).
const Module = require('module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
    if (typeof request === 'string' && request.startsWith('@/')) {
        request = path.join(distDir, request.slice(2) + '.js');
    }
    return origResolve.call(this, request, ...args);
};

const svcPath = path.join(distDir, 'services/reviewer/AIReviewerService.js');
const {
    AIReviewerService,
    AI_REVIEWER_CONFIG_KEY,
    AI_REVIEWER_IDENTITY,
    AI_RECOMMENDATION_VOCABULARY,
} = require(svcPath);

let passed = 0;
let failed = 0;
function check(name, cond, extra = '') {
    if (cond) { passed += 1; console.log(`  PASS  ${name}`); }
    else { failed += 1; console.log(`  FAIL  ${name} ${extra}`); }
}

// ─── Fake Supabase client (mutable, dengan proteksi read-only per tabel) ───
const violations = []; // upaya tulis ke tabel read-only

class FakeBuilder {
    constructor(table) {
        this.table = table;
        this._filters = {};
        this._payload = null;
        this._kind = 'select';
    }
    select() { if (this._payload === null) this._kind = 'select'; return this; }
    insert(p) { this._kind = 'insert'; this._payload = p; return this; }
    update(p) { this._kind = 'update'; this._payload = p; return this; }
    upsert(p) { this._kind = 'upsert'; this._payload = p; return this; }
    eq(col, val) { this._filters[col] = val; return this; }
    _filtered() {
        return this.table.rows.filter(r =>
            Object.entries(this._filters).every(([c, v]) => r[c] === v));
    }
    async _exec() {
        if (this._kind !== 'select') {
            this.table.writeCount += 1;
            if (this.table.readOnly) {
                violations.push(`${this.table.name}:${this._kind}`);
                throw new Error(`WRITE_DETECTED:${this.table.name}:${this._kind}`);
            }
        }
        if (this._kind === 'insert') {
            const id = 'gen-' + Math.random().toString(36).slice(2, 10);
            const row = { ...(Array.isArray(this._payload) ? this._payload[0] : this._payload), id };
            this.table.rows.push(row);
            return { data: [row], error: null };
        }
        if (this._kind === 'update') {
            const matched = this._filtered();
            matched.forEach(r => Object.assign(r, this._payload));
            return { data: matched, error: null };
        }
        if (this._kind === 'upsert') {
            const p = Array.isArray(this._payload) ? this._payload[0] : this._payload;
            const idx = this.table.rows.findIndex(r => r.key === p.key);
            if (idx >= 0) this.table.rows[idx] = { ...this.table.rows[idx], ...p };
            else this.table.rows.push({ id: 'gen-' + Math.random().toString(36).slice(2, 10), ...p });
            return { data: [p], error: null };
        }
        return { data: this._filtered(), error: null };
    }
    single() {
        return this._exec().then(r => ({
            data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data,
            error: r.error,
        }));
    }
    maybeSingle() { return this.single(); }
    then(res, rej) { return this._exec().then(res, rej); }
}
function makeClient(settingsRows, submissionRow, opts = {}) {
    const tables = {
        system_settings: { name: 'system_settings', rows: settingsRows, readOnly: false, writeCount: 0 },
        submissions: { name: 'submissions', rows: submissionRow ? [submissionRow] : [], readOnly: true, writeCount: 0 },
        review_assignments: { name: 'review_assignments', rows: opts.assignments || [], readOnly: false, writeCount: 0 },
        submission_activity_log: { name: 'submission_activity_log', rows: opts.auditRows || [], readOnly: false, writeCount: 0 },
    };
    return {
        _tables: tables,
        from(t) {
            const table = tables[t];
            if (!table) throw new Error('UNEXPECTED_TABLE:' + t);
            return new FakeBuilder(table);
        },
    };
}

const goodSubmission = {
    id: 'sub-ai-1',
    title: 'Analisis Machine Learning untuk Prediksi Kualitas Udara di Perkotaan',
    abstract: JSON.stringify({
        abstract_en: 'This study presents an analysis of machine learning models for urban air quality prediction. The background of this research is the increasing pollution level in major cities. The proposed method applies a framework that combines sensor data with deep neural networks. The data was collected from environmental monitoring sensors over twelve months. The results show significant accuracy improvements compared with baseline models, and the validation confirms reliability across independent datasets. In conclusion, the evaluation demonstrates that this approach is a useful reference for urban planning. Additional references to prior studies are included.',
        abstract_id: 'Penelitian ini menganalisis model pembelajaran mesin untuk prediksi kualitas udara dengan data sensor dan validasi signifikan.',
        authors: [{ full_name: 'Budi Santoso' }],
        keywords: 'machine learning, air quality, prediction',
        publicationType: 'research',
    }),
    keywords: 'machine learning, urban, air quality',
    journal_name: 'IAEP Journal',
};

const VALID_RECS = [...AI_RECOMMENDATION_VOCABULARY];

async function main() {
    console.log('== A. Role gates (pure) ==');
    check('A1 canManageConfig(super_admin) = true', AIReviewerService.canManageConfig('super_admin') === true);
    check('A2 canManageConfig(superadmin) = true', AIReviewerService.canManageConfig('superadmin') === true);
    check('A3 canManageConfig(co_admin) = false', AIReviewerService.canManageConfig('co_admin') === false);
    check('A4 canManageConfig(editor) = false', AIReviewerService.canManageConfig('editor') === false);
    check('A5 canManageConfig(reviewer) = false', AIReviewerService.canManageConfig('reviewer') === false);
    check('A6 canManageConfig(null) = false', AIReviewerService.canManageConfig(null) === false);
    check('A7 canRunAIReview(editor) = true', AIReviewerService.canRunAIReview('editor') === true);
    check('A8 canRunAIReview(co_admin) = true', AIReviewerService.canRunAIReview('co_admin') === true);
    check('A9 canRunAIReview(super_admin) = true', AIReviewerService.canRunAIReview('super_admin') === true);
    check('A10 canRunAIReview(reviewer) = false', AIReviewerService.canRunAIReview('reviewer') === false);
    check('A11 canRunAIReview(author) = false', AIReviewerService.canRunAIReview('author') === false);
    check('A12 canRunAIReview("") = false', AIReviewerService.canRunAIReview('') === false);

    console.log('== B. updateConfig governance ==');
    {
        const client = makeClient([], null);
        const res = await AIReviewerService.updateConfig(client, { enabled: true, mode: 'optional' }, { id: 'u-sa', role: 'super_admin' });
        const upsertCalled = client._tables.system_settings.writeCount === 1;
        check('B1 super_admin dapat menyimpan config', res.success === true && upsertCalled);
        const saved = client._tables.system_settings.rows.find(r => r.key === AI_REVIEWER_CONFIG_KEY);
        const savedJson = saved ? JSON.parse(saved.value) : null;
        check('B2 config tersimpan enabled+optional', !!savedJson && savedJson.enabled === true && savedJson.mode === 'optional');
        check('B3 identitas updated_by tersimpan', !!savedJson && savedJson.updated_by === 'u-sa');
    }
    {
        const client = makeClient([], null);
        for (const role of ['editor', 'co_admin', 'reviewer', 'author', null]) {
            const res = await AIReviewerService.updateConfig(client, { enabled: true, mode: 'optional' }, { id: 'u-x', role });
            check(`B4 updateConfig ditolak role=${role}`, res.success === false && /SUPER_ADMIN/.test(res.error || '') && client._tables.system_settings.writeCount === 0);
        }
    }
    {
        const client = makeClient([], null);
        const res = await AIReviewerService.updateConfig(client, { enabled: true, mode: 'turbo' }, { id: 'u-sa', role: 'super_admin' });
        check('B5 mode invalid ditolak', res.success === false && client._tables.system_settings.writeCount === 0);
    }
    {
        const client = makeClient([], null);
        const res = await AIReviewerService.updateConfig(client, { enabled: true, mode: 'disabled' }, { id: 'u-sa', role: 'super_admin' });
        check('B6 mode disabled memaksa enabled=false', res.success === true && res.config.enabled === false && res.config.mode === 'disabled');
    }

    console.log('== C. getConfig parsing ==');
    {
        const client = makeClient([], null);
        const cfg = await AIReviewerService.getConfig(client);
        check('C1 tanpa row -> default', cfg.enabled === false && cfg.mode === 'disabled');
    }
    {
        const client = makeClient([{ key: AI_REVIEWER_CONFIG_KEY, value: JSON.stringify({ enabled: true, mode: 'mandatory', updated_at: '2026-08-04T00:00:00Z', updated_by: 'u-sa' }) }], null);
        const cfg = await AIReviewerService.getConfig(client);
        check('C2 row valid ter-parse', cfg.enabled === true && cfg.mode === 'mandatory' && cfg.updatedBy === 'u-sa');
    }
    {
        const client = makeClient([{ key: AI_REVIEWER_CONFIG_KEY, value: '{broken-json' }], null);
        const cfg = await AIReviewerService.getConfig(client);
        check('C3 JSON rusak -> default', cfg.enabled === false && cfg.mode === 'disabled');
    }
    {
        const client = makeClient([{ key: AI_REVIEWER_CONFIG_KEY, value: JSON.stringify({ enabled: true, mode: 'hacked' }) }], null);
        const cfg = await AIReviewerService.getConfig(client);
        check('C4 mode asing disanitize -> disabled', cfg.mode === 'disabled' && cfg.enabled === false);
    }
    console.log('== D. analyzeSubmission ==');
    {
        const r1 = AIReviewerService.analyzeSubmission(goodSubmission);
        check('D1 naskah baik: skor >= 65', r1.overallScore >= 65, `(skor=${r1.overallScore})`);
        check('D2 rekomendasi dalam kosakata valid', VALID_RECS.includes(r1.recommendation), `(rec=${r1.recommendation})`);
        check('D3 semua dimensi berskor 0-100', Object.values(r1.dimensionScores).every(v => v >= 0 && v <= 100));
        check('D4 laporan memuat disclaimer advisory', /advisory/i.test(r1.report) && /Disclaimer/.test(r1.report));
        check('D5 comments tidak kosong', Array.isArray(r1.comments) && r1.comments.length > 0);
        const r2 = AIReviewerService.analyzeSubmission(goodSubmission);
        check('D6 deterministik (output identik)', JSON.stringify(r1) === JSON.stringify(r2));
    }
    {
        const weak = { id: 'sub-ai-2', title: '', abstract: '', keywords: '' };
        const r = AIReviewerService.analyzeSubmission(weak);
        check('D7 naskah kosong: skor rendah', r.overallScore <= 40, `(skor=${r.overallScore})`);
        check('D8 naskah kosong: reject/resubmit', ['reject', 'resubmit'].includes(r.recommendation), `(rec=${r.recommendation})`);
        check('D9 naskah kosong tetap ada komentar', r.comments.length > 0);
    }

    console.log('== E. generateReview governance ==');
    const enabledSettings = [{ key: AI_REVIEWER_CONFIG_KEY, value: JSON.stringify({ enabled: true, mode: 'optional' }) }];
    {
        const client = makeClient(enabledSettings, goodSubmission);
        const res = await AIReviewerService.generateReview(client, 'sub-ai-1', { id: 'u-editor', role: 'editor' });
        check('E1 editor dapat menjalankan AI review', res.success === true, `(err=${res.error})`);
        const rows = client._tables.review_assignments.rows;
        check('E2 tepat satu assignment AI tersimpan', rows.length === 1);
        const a = rows[0] || {};
        check('E3 reviewer_type = AI', a.reviewer_type === 'AI');
        check('E4 reviewer_id = null (tanpa profil)', a.reviewer_id === null);
        check('E5 identitas sentinel benar', a.reviewer_email === AI_REVIEWER_IDENTITY.email && a.reviewer_name === AI_REVIEWER_IDENTITY.name);
        check('E6 status completed', a.status === 'completed');
        check('E7 rekomendasi valid (advisory)', VALID_RECS.includes(a.recommendation));
        check('E8 laporan tersimpan utk editor', typeof a.comments_for_editor === 'string' && /Disclaimer/.test(a.comments_for_editor));
        check('E9 score JSONB tersimpan', !!a.score && typeof a.score.overall === 'number');
        check('E10 TIDAK ada tulis ke submissions', client._tables.submissions.writeCount === 0);
        const audits = client._tables.submission_activity_log.rows;
        check('E11 audit trail tercatat', audits.length === 1 && audits[0].action === 'AI_REVIEW_GENERATED' && audits[0].actor_role === 'editor');
        const again = await AIReviewerService.generateReview(client, 'sub-ai-1', { id: 'u-editor', role: 'editor' });
        check('E12 re-run berhasil (update, bukan duplikat)', again.success === true && client._tables.review_assignments.rows.length === 1);
        const found = await AIReviewerService.getAIAssignment(client, 'sub-ai-1');
        check('E13 getAIAssignment menemukan baris AI', !!found && found.reviewer_type === 'AI');
        check('E14 pelanggaran read-only = 0', violations.length === 0, violations.join(','));
    }
    {
        const disabledSettings = [{ key: AI_REVIEWER_CONFIG_KEY, value: JSON.stringify({ enabled: false, mode: 'optional' }) }];
        const client = makeClient(disabledSettings, goodSubmission);
        const res = await AIReviewerService.generateReview(client, 'sub-ai-1', { id: 'u-editor', role: 'editor' });
        check('E15 config disabled -> ditolak', res.success === false && client._tables.review_assignments.rows.length === 0);
    }
    {
        const mandatoryOff = [{ key: AI_REVIEWER_CONFIG_KEY, value: JSON.stringify({ enabled: false, mode: 'mandatory' }) }];
        const client = makeClient(mandatoryOff, goodSubmission);
        const res = await AIReviewerService.generateReview(client, 'sub-ai-1', { id: 'u-editor', role: 'editor' });
        check('E16 mode mandatory + enabled=false -> ditolak', res.success === false);
    }
    {
        const mandatoryOn = [{ key: AI_REVIEWER_CONFIG_KEY, value: JSON.stringify({ enabled: true, mode: 'mandatory' }) }];
        const client = makeClient(mandatoryOn, goodSubmission);
        const res = await AIReviewerService.generateReview(client, 'sub-ai-1', { id: 'u-co', role: 'co_admin' });
        check('E17 mode mandatory + co_admin -> berhasil', res.success === true);
    }
    {
        const client = makeClient(enabledSettings, null);
        const res = await AIReviewerService.generateReview(client, 'sub-tidak-ada', { id: 'u-editor', role: 'editor' });
        check('E18 naskah tidak ditemukan -> gagal aman', res.success === false && /tidak ditemukan/i.test(res.error || ''));
    }

    console.log('== F. Governance struktural ==');
    {
        const src = fs.readFileSync(svcPath, 'utf8');
        const requires = [...src.matchAll(/require\("([^"]+)"\)/g)].map(m => m[1]);
        check('F1 tidak ada require modul lifecycle', !requires.some(r => /lifecycle/i.test(r)), requires.join(','));
        check('F2 dependensi hanya roles/permissions/matching', requires.length === 3 && requires.some(r => r.includes('roles')) && requires.some(r => r.includes('permissions')) && requires.some(r => r.includes('ReviewerMatchingService')));
        check('F3 tidak ada require service keputusan editorial', !requires.some(r => /decision|editorial/i.test(r)));
    }
}

main().then(() => {
    console.log('──────────────────────────────────────');
    console.log(`TOTAL: ${passed} passed, ${failed} failed`);
    if (failed > 0 || violations.length > 0) process.exitCode = 1;
}).catch(e => {
    console.error('FATAL', e);
    process.exitCode = 1;
});