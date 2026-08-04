/**
 * Scratch verification (non-production, non-route) untuk Target #1:
 * IAEP Submission Lifecycle State Machine.
 *
 * Menjalankan matriks transisi + uji layanan lifecycle terhadap mock Supabase.
 * Jalankan: node scratch/lifecycle-transition-check.mjs
 */
const path = require('path');
const buildDir = path.join(__dirname, '.build-check');

const domain = require(path.join(buildDir, 'domain/submission/SubmissionStatus.js'));
const sm = require(path.join(buildDir, 'utils/SubmissionStateMachine.js'));
const { SubmissionLifecycleService } = require(path.join(buildDir, 'services/SubmissionLifecycleService.js'));

let pass = 0, fail = 0;
function ok(cond, label) {
    if (cond) { pass++; console.log(`  PASS  ${label}`); }
    else { fail++; console.error(`  FAIL  ${label}`); }
}
function expectValid(from, to) {
    const r = sm.validateTransition(from, to);
    ok(r.valid, `valid: "${from || '(empty)'}" → "${to}"${r.reason ? ' [' + r.reason + ']' : ''}`);
}
function expectInvalid(from, to) {
    const r = sm.validateTransition(from, to);
    ok(!r.valid, `invalid: "${from}" → "${to}" (alasan: ${r.reason || '-'})`);
}

console.log('== 1. Matriks transisi state machine ==');
// Forward / intake
expectValid('', 'Awaiting Reviewers');
expectValid('queued', 'Awaiting Reviewers');
expectValid('Submitted', 'Awaiting Reviewers');
expectValid('Awaiting Reviewers', 'Under Review');
expectValid('Under Review', 'Reviewed');
expectValid('Reviewed', 'Accepted');
// Fase review: pergerakan bebas
expectValid('Under Review', 'Awaiting Reviewers');
expectValid('Reviewed', 'Under Review');
expectValid('Reviewed', 'Needs Revision');
// Siklus revisi (level setara)
expectValid('Needs Revision', 'Revision Submitted');
expectValid('Revision Submitted', 'Revision Under Review');
expectValid('Revision Under Review', 'Reviewed');
// Keputusan & produksi
expectValid('Accepted', 'Assigned to Layout');
expectValid('Assigned to Layout', 'Assigned to Cover');
expectValid('Assigned to Cover', 'Pending Supervisor');
expectValid('Pending Supervisor', 'Production Completed');
expectValid('Production Completed', 'Published');
expectValid('Pending Supervisor', 'Assigned to Layout'); // plateau bebas
expectValid('Published', 'Published');                   // no-op
expectValid('SomeUnknownLegacy', 'Published');           // asal tak dikenal → toleran
// Pengecualian downgrade editorial
expectValid('Accepted', 'Needs Revision');
expectValid('Accepted', 'Revision Required');
// Penolakan
expectInvalid('Published', 'Under Review');      // terminal
expectInvalid('Rejected', 'Accepted');           // terminal
expectInvalid('Declined', 'Needs Revision');     // terminal
expectInvalid('Accepted', 'Under Review');       // downgrade non-excepted
expectInvalid('Production Completed', 'Pending Supervisor'); // downgrade 7→6
expectInvalid('Under Review', 'queued');         // keluar fase review ke intake
expectInvalid('Reviewed', 'Bogus Status');       // target tak dikenal
// Desk Reject (keputusan terminal dari drawer Incoming)
expectValid('queued', 'Desk Reject');
expectValid('Submitted', 'Desk Reject');
expectInvalid('Desk Reject', 'Awaiting Reviewers'); // terminal

console.log('== 2. Kompatibilitas ekspor lama ==');
ok(typeof sm.STATUS_LEVELS === 'object' && sm.STATUS_LEVELS['queued'] === 1, 'STATUS_LEVELS di-reexport (queued=1)');
ok(sm.STATUS_LEVELS['Published'] === 8 && sm.STATUS_LEVELS['published'] === 8, 'STATUS_LEVELS Published/published=8');
ok(sm.getStatusLevel('Pending Supervisor') === 6, 'getStatusLevel("Pending Supervisor")=6');
ok(sm.getStatusLevel('') === 0, 'getStatusLevel("")=0');
ok(sm.canTransition('Under Review', 'Reviewed') === true, 'canTransition kompatibel: true');
ok(sm.canTransition('Published', 'Under Review') === false, 'canTransition kompatibel: false (terminal)');
ok(sm.isDoiImmutable('10.1/x', null) === true, 'isDoiImmutable tetap ada (proteksi)');
ok(sm.isDoiImmutable(null, '10.1/x') === false, 'isDoiImmutable tetap ada (bebas)');

console.log('== 3. Domain helpers ==');
ok(domain.isKnownSubmissionStatus('Revision Under Review'), 'isKnownSubmissionStatus("Revision Under Review")');
ok(!domain.isKnownSubmissionStatus('Terbit!'), '!isKnownSubmissionStatus("Terbit!")');
ok(domain.isTerminalSubmissionStatus('published'), 'isTerminalSubmissionStatus("published")');
ok(domain.isKnownSubmissionStage('Production'), 'isKnownSubmissionStage("Production")');
ok(!domain.isKnownSubmissionStage('Produksi'), '!isKnownSubmissionStage("Produksi")');

console.log('== 4. SubmissionLifecycleService dengan mock Supabase ==');
function makeMockSupabase(initialStatus, initialStage, opts) {
    const rowVisible = !(opts && opts.rowVisible === false);
    const calls = { updates: [], history: [] };
    const client = {
        from(table) {
            return {
                select() {
                    return {
                        eq() {
                            return {
                                async maybeSingle() {
                                    if (!rowVisible) return { data: null, error: null };
                                    return { data: { id: 'sub-1', status: initialStatus, stage: initialStage }, error: null };
                                }
                            };
                        }
                    };
                },
                update(payload) {
                    return {
                        eq(col, val) {
                            calls.updates.push({ table, payload, col, val });
                            return Promise.resolve({ error: null });
                        }
                    };
                },
                insert(row) {
                    calls.history.push(row);
                    return Promise.resolve({ error: null });
                }
            };
        }
    };
    return { client, calls };
}

(async () => {
    // 4.1 Transisi normal tercatat + history
    let m = makeMockSupabase('Awaiting Reviewers', 'Review');
    let r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', {
        status: 'Under Review', actorId: 'editor-1', history: { action: 'Test', details: 'd' }
    });
    ok(r.success, '4.1a Awaiting Reviewers → Under Review sukses');
    ok(m.calls.updates.length === 1 && m.calls.updates[0].payload.status === 'Under Review', '4.1b payload update benar');
    ok(m.calls.updates[0].payload.updated_at instanceof Date, '4.1c updated_at terisi');
    ok(m.calls.history.length === 1 && m.calls.history[0].action === 'Test', '4.1d history tercatat');

    // 4.2 Transisi dari status terminal ditolak, tanpa update
    m = makeMockSupabase('Published', 'Published');
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', { status: 'Under Review' });
    ok(!r.success && /terminal/.test(r.error || ''), '4.2a Published → Under Review ditolak');
    ok(m.calls.updates.length === 0, '4.2b tidak ada update DB');

    // 4.3 Force override untuk pemulihan admin
    m = makeMockSupabase('Pending Supervisor', 'Production');
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', {
        stage: 'Review', status: 'Under Review', force: true, reason: 'recovery test'
    });
    ok(r.success && r.forced === true, '4.3a force downgrade sukses');
    ok(m.calls.updates[0].payload.stage === 'Review' && m.calls.updates[0].payload.status === 'Under Review', '4.3b payload force benar');

    // 4.4 Status target tak dikenal ditolak
    m = makeMockSupabase('Under Review', 'Review');
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', { status: 'Terbit!' });
    ok(!r.success && /tidak dikenal/.test(r.error || ''), '4.4 target tak dikenal ditolak');

    // 4.5 Stage tak dikenal ditolak
    m = makeMockSupabase('Under Review', 'Review');
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', { stage: 'Produksi' });
    ok(!r.success && /Stage/.test(r.error || ''), '4.5 stage tak dikenal ditolak');

    // 4.6 Mirror legacy (submission_id)
    m = makeMockSupabase('Awaiting Reviewers', 'Review');
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', {
        status: 'Under Review', mirrorLegacySubmissionId: true
    });
    const mirror = m.calls.updates.find(u => u.col === 'submission_id');
    ok(r.success && mirror && mirror.payload.status === 'Under Review', '4.6 mirror legacy submission_id');

    // 4.7 Stage-only (status dipertahankan)
    m = makeMockSupabase('Accepted', 'Review');
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', { stage: 'Copyediting' });
    ok(r.success && m.calls.updates[0].payload.stage === 'Copyediting' && !('status' in m.calls.updates[0].payload), '4.7 stage-only tanpa ubah status');

    // 4.8 Baris tak terlihat (RLS) → lanjut tanpa validasi asal
    m = makeMockSupabase(null, null, { rowVisible: false });
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', { status: 'Published' });
    ok(r.success && m.calls.updates.length === 1, '4.8 RLS-invisible row tetap update');

    // 4.9 extraFields ikut tersimpan
    m = makeMockSupabase('Production Completed', 'Production');
    r = await SubmissionLifecycleService.transitionTo(m.client, 'sub-1', {
        status: 'Published', stage: 'Published', extraFields: { volume: 'Vol 1', issue: 'No 1' }
    });
    const p = m.calls.updates[0].payload;
    ok(r.success && p.volume === 'Vol 1' && p.issue === 'No 1' && p.status === 'Published', '4.9 extraFields tersimpan');

    console.log(`\nHASIL: ${pass} passed, ${fail} failed`);
    process.exit(fail === 0 ? 0 : 1);
})();
