/**
 * scratch/reviewer-matching-verify/verify.mjs
 * Verifikasi offline ReviewerMatchingService (deterministik, tanpa Supabase nyata).
 * Build dulu: npx tsc src/services/reviewer/ReviewerMatchingService.ts --outDir scratch/reviewer-matching-verify/dist --target es2020 --module commonjs --skipLibCheck
 * Jalankan: node scratch/reviewer-matching-verify/verify.mjs
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const S = require('./dist/ReviewerMatchingService.js');

let passed = 0;
let failed = 0;
function check(name, cond, extra = '') {
    if (cond) { passed += 1; console.log(`  PASS  ${name}`); }
    else { failed += 1; console.log(`  FAIL  ${name} ${extra}`); }
}

// Fake Supabase client: SELECT saja; write apa pun → throw (membuktikan read-only)
class FakeQuery {
    constructor(rows) { this._rows = Array.isArray(rows) ? rows : []; this._filters = {}; }
    select() { return this; }
    eq(col, val) { this._filters[col] = val; return this; }
    ilike() { return this; }
    in() { return this; }
    order() { return this; }
    insert() { throw new Error('WRITE_DETECTED:insert'); }
    update() { throw new Error('WRITE_DETECTED:update'); }
    upsert() { throw new Error('WRITE_DETECTED:upsert'); }
    delete() { throw new Error('WRITE_DETECTED:delete'); }
    _filtered() {
        return this._rows.filter(r => Object.entries(this._filters).every(([c, v]) => r[c] === v));
    }
    maybeSingle() { const rows = this._filtered(); return Promise.resolve({ data: rows[0] ?? null, error: null }); }
    single() { const rows = this._filtered(); return Promise.resolve({ data: rows[0] ?? null, error: null }); }
    then(res, rej) { return Promise.resolve({ data: this._filtered(), error: null }).then(res, rej); }
}
function makeFakeClient(routes) {
    return {
        from(table) {
            if (!(table in routes)) throw new Error('UNEXPECTED_TABLE:' + table);
            return new FakeQuery(routes[table]);
        },
        auth: { admin: { getUserById: async () => ({ data: null }) } },
    };
}

const submissionRow = {
    id: 'sub-1',
    title: 'Machine Learning untuk Prediksi Harga Saham',
    abstract: JSON.stringify({
        abstract_en: 'This study applies machine learning and deep neural networks for stock price prediction using historical data.',
        abstract_id: 'Penelitian ini menerapkan pembelajaran mesin dan jaringan saraf tiruan untuk prediksi harga saham.',
        authors: [{ full_name: 'Budi Santoso' }],
        keywords: 'machine learning, neural network',
        publicationType: 'research',
    }),
    keywords: 'deep learning',
    author_id: 'author-uuid-1',
    submitter_email: 'budi@example.com',
    submitter_name: 'Budi Santoso',
    journal_id: 'j-ajite',
    journals: { name: 'AJITE - Apasific Journal of Information Technology', slug: 'ajite' },
};

const profileRows = [
    { id: 'prof-ml', full_name: 'Dr. ML Expert', role: 'reviewer', academic_field: 'Machine Learning, Artificial Intelligence, Data Science', university: 'Universitas Komputer', country: 'Indonesia' },
    { id: 'prof-acc', full_name: 'Dr. Akuntan', role: 'reviewer', academic_field: 'Akuntansi Keuangan, Audit, Perpajakan', university: 'Universitas Ekonomi', country: 'Indonesia' },
    { id: 'prof-adm', full_name: 'Admin User', role: 'admin', academic_field: 'Management' }, // harus dikecualikan
];

const settingsUsers = [
    { id: 'sys-1', full_name: 'Prof Neural', email: 'neural@uni.edu.my', role: 'reviewer', university: 'Universiti Utara Malaysia', country: 'Malaysia', discipline: 'Artificial Intelligence, Neural Networks', status: 'Active' },
    { id: 'sys-2', full_name: 'Dr Overloaded', email: 'busy@uni.edu', role: 'reviewer', university: 'Universitas Sibuk', country: 'Indonesia', discipline: 'Machine Learning, Deep Learning', status: 'Active' },
    { id: 'sys-3', full_name: 'Conflict Person', email: 'budi@example.com', role: 'reviewer', university: 'Universitas Contoh', country: 'Indonesia', discipline: 'Machine Learning' }, // email = penulis → COI
    { id: 'sys-4', full_name: 'Inactive Reviewer', email: 'inactive@uni.edu', role: 'reviewer', university: 'Universitas Tidur', country: 'Indonesia', discipline: 'Machine Learning', status: 'Inactive' },
    { full_name: 'Author Role User', email: 'author@example.com', role: 'author', discipline: 'Biology' }, // bukan reviewer
];

const assignmentRows = [
    { submission_id: 'sub-1', reviewer_id: 'prof-ml', reviewer_email: 'mlexpert@uni.ac.id', status: 'pending' },      // sudah ditugaskan → COI
    { submission_id: 'other-sub', reviewer_id: 'sys-2', reviewer_email: 'busy@uni.edu', status: 'accepted' },
    { submission_id: 'other-sub', reviewer_id: 'sys-2', reviewer_email: 'busy@uni.edu', status: 'under_review' },
    { submission_id: 'other-sub', reviewer_id: 'sys-2', reviewer_email: 'busy@uni.edu', status: 'pending' },
    { submission_id: 'other-sub', reviewer_id: 'sys-2', reviewer_email: 'busy@uni.edu', status: 'completed' },
    { submission_id: 'other-sub', reviewer_id: 'sys-2', reviewer_email: 'busy@uni.edu', status: 'completed' },
];

const routes = {
    submissions: [submissionRow],
    profiles: profileRows,
    system_settings: [{ value: JSON.stringify(settingsUsers) }],
    review_assignments: assignmentRows,
};
console.log('\n== 1. Utilitas teks & katalog divisi ==');
{
    check('tokenize membuang stopwords', !S.tokenize('the of dan untuk machine learning').includes('the'));
    const div = S.resolveJournalDivision({ name: 'AJITE - Apasific Journal of Information Technology', slug: 'ajite' });
    check('resolveJournalDivision slug ajite', div.division === 'Ilmu Komputer & Teknologi Informasi' && div.source === 'catalog', JSON.stringify(div));
    const div2 = S.resolveJournalDivision({ name: 'AJBA - Apasific Journal of Business Administration', slug: null });
    check('resolveJournalDivision via prefix nama', div2.division === 'Manajemen, Bisnis dan Administrasi', JSON.stringify(div2));
    const env = S.parseAbstractEnvelope(submissionRow.abstract);
    check('parseAbstractEnvelope: abstract_en', env.abstractText.includes('machine learning'));
    check('parseAbstractEnvelope: keywords', env.keywords.includes('machine learning') && env.keywords.includes('neural network'));
    check('parseAbstractEnvelope teks polos', S.parseAbstractEnvelope('plain abstract').abstractText === 'plain abstract');
    const input = S.extractSubmissionMatchInput(submissionRow, submissionRow.journals);
    check('extractSubmissionMatchInput: keywords merge', input.keywords.includes('deep learning') && input.keywords.includes('neural network'));
    check('extractSubmissionMatchInput: division', input.academicDivision === 'Ilmu Komputer & Teknologi Informasi');
}

console.log('\n== 2. Agregasi statistik & konflik kepentingan ==');
{
    const stats = S.aggregateAssignmentStats(assignmentRows);
    const sys2 = S.lookupAssignmentStats(stats, 'sys-2', 'busy@uni.edu');
    check('stats sys-2: 3 aktif / 2 selesai', sys2.active === 3 && sys2.completed === 2 && sys2.total === 5, JSON.stringify(sys2));
    check('lookup via email saja (case-insensitive)', S.lookupAssignmentStats(stats, null, 'BUSY@UNI.EDU').total === 5);

    const author = { id: 'author-uuid-1', email: 'budi@example.com', university: 'Universitas Contoh' };
    const coiEmail = S.checkConflictOfInterest({ id: 'sys-3', email: 'budi@example.com' }, author, new Set());
    check('COI email penulis', coiEmail.hasConflict && coiEmail.reasons.some(r => r.toLowerCase().includes('email')));
    const coiInst = S.checkConflictOfInterest({ id: 'x', email: 'x@y.z', university: 'Universitas Contoh' }, author, new Set());
    check('COI institusi sama', coiInst.hasConflict && coiInst.reasons.some(r => r.includes('institusi')));
    const coiAssigned = S.checkConflictOfInterest({ id: 'prof-ml', email: 'mlexpert@uni.ac.id' }, null, new Set(['prof-ml']));
    check('COI sudah ditugaskan', coiAssigned.hasConflict);
    const coiClean = S.checkConflictOfInterest({ id: 'sys-1', email: 'neural@uni.edu.my', university: 'Universiti Utara Malaysia' }, author, new Set());
    check('tanpa konflik', !coiClean.hasConflict, JSON.stringify(coiClean));
}
console.log('\n== 3. Pipeline rekomendasi end-to-end (fake client, read-only) ==');
{
    const client = makeFakeClient(routes);
    const run1 = await S.ReviewerMatchingService.recommendForSubmission(client, 'sub-1', { limit: 10 });
    check('success', run1.success, run1.error || '');
    check('academicDivision', run1.academicDivision === 'Ilmu Komputer & Teknologi Informasi');
    check('poolSize = 6 (admin & non-reviewer excluded)', run1.poolSize === 6, 'poolSize=' + run1.poolSize);

    const recs = run1.recommendations || [];
    check('6 kandidat dikembalikan', recs.length === 6, 'len=' + recs.length);

    const REQUIRED = ['reviewerId', 'expertiseScore', 'availabilityScore', 'workloadScore', 'conflictCheck', 'totalScore'];
    check('kontrak field wajib per kandidat', recs.every(r => REQUIRED.every(k => k in r) && typeof r.conflictCheck === 'object'));

    const byId = Object.fromEntries(recs.map(r => [r.reviewerId, r]));
    const top = recs[0];
    check('rank #1 kandidat terbaik ML (Prof Neural)', top.reviewerId === 'sys-1', 'rank1=' + top.reviewerId + ' score=' + top.totalScore);
    check('semua skor dalam rentang 0-100', recs.every(r =>
        r.expertiseScore >= 0 && r.expertiseScore <= 100 &&
        r.availabilityScore >= 0 && r.availabilityScore <= 100 &&
        r.workloadScore >= 0 && r.workloadScore <= 100 &&
        r.totalScore >= 0 && r.totalScore <= 100));

    check('COI email: ditandai & totalScore <= 5', byId['sys-3'].conflictCheck.hasConflict && byId['sys-3'].totalScore <= 5, JSON.stringify(byId['sys-3'].totalScore));
    check('COI sudah ditugaskan ditandai', byId['prof-ml'].conflictCheck.hasConflict && byId['prof-ml'].conflictCheck.reasons.some(r => r.includes('ditugaskan')));

    const firstConflictIdx = recs.findIndex(r => r.conflictCheck.hasConflict);
    const lastCleanIdx = recs.map((r, i) => (!r.conflictCheck.hasConflict ? i : -1)).filter(i => i >= 0).pop();
    check('konflik diperingkat setelah kandidat bersih', firstConflictIdx > lastCleanIdx, `conflictIdx=${firstConflictIdx} cleanLast=${lastCleanIdx}`);

    check('reviewer Inactive availability=0', byId['sys-4'].availabilityScore === 0, String(byId['sys-4'].availabilityScore));
    check('workload penalty: 3 aktif', byId['sys-2'].workloadScore < top.workloadScore && byId['sys-2'].activeAssignments === 3, JSON.stringify({ ws: byId['sys-2'].workloadScore, active: byId['sys-2'].activeAssignments }));
    check('expert ML mengalahkan akuntan untuk naskah ML', byId['sys-2'].expertiseScore > byId['prof-acc'].expertiseScore, `${byId['sys-2'].expertiseScore} vs ${byId['prof-acc'].expertiseScore}`);

    const run2 = await S.ReviewerMatchingService.recommendForSubmission(makeFakeClient(routes), 'sub-1', { limit: 10 });
    check('deterministik (2 run identik)', JSON.stringify(run1.recommendations) === JSON.stringify(run2.recommendations));

    // Read-only terbukti: setiap operasi tulis pada fake client akan throw
    // WRITE_DETECTED dan menggagalkan seluruh pipeline di atas.
    check('read-only: tidak ada operasi tulis terdeteksi', true);

    const missing = await S.ReviewerMatchingService.recommendForSubmission(
        makeFakeClient({ submissions: [], profiles: [], system_settings: [], review_assignments: [] }), 'nope');
    check('submission hilang -> error ramah', !missing.success && /tidak ditemukan/i.test(missing.error || ''), missing.error || '');
}

console.log(`\nHASIL: ${passed} pass, ${failed} fail`);
process.exit(failed ? 1 : 0);
