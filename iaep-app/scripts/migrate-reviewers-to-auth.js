/**
 * APASIFIC IAEP — Reviewer Dropset Migration to Supabase Auth
 *
 * Classification: Infrastructure Data Migration (NOT Authentication Refactor)
 *
 * Problem: Reviewer accounts were seeded as dropset/JSON data. They exist in
 *   - system_settings.apasific_registered_users
 *   - apasific_registered_users.json (fallback)
 * but NOT in Supabase Auth (auth.users), causing "Email atau password salah".
 *
 * This script safely provisions those reviewers into official IAEP identity:
 *   1. Dry-run report (default) — never writes.
 *   2. --apply  — create missing auth.users + upsert profiles.
 *   3. --verify — check each reviewer can authenticate (email + ReviewerPassword123!).
 *
 * Idempotent: running twice never creates duplicates.
 *
 * Explicitly does NOT modify:
 *   loginUser(), IdentityResolver, RBAC, ReviewerMatchingService,
 *   reviewer workflow, or any UI.
 *
 * Uses Supabase Admin REST API directly (no @supabase/supabase-js) to avoid
 * WebSocket issues in Node 20 — same approach as scripts/provision-users.js.
 */

const fs   = require('fs');
const path = require('path');

// ─── Default password (per task requirement) ───────────────────────────────
const DEFAULT_PASSWORD = 'ReviewerPassword123!';

// ─── Load .env.local ───────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...rest] = line.split('=');
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: SUPABASE env vars tidak ditemukan di .env.local');
  console.error('   Butuh: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const HEADERS = {
  'apikey':       SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

// ─── Flags ─────────────────────────────────────────────────────────────────
const IS_APPLY   = process.argv.includes('--apply');
const IS_VERIFY  = process.argv.includes('--verify');
const MODE       = IS_VERIFY ? 'VERIFY' : (IS_APPLY ? 'APPLY' : 'DRY-RUN');

// ─── Helpers ───────────────────────────────────────────────────────────────
function normalizeEmail(e) {
  return String(e || '').trim().toLowerCase();
}

/** Source priority: system_settings first, JSON file fallback. */
async function readReviewers() {
  let reviewers = [];

  // 1. system_settings.apasific_registered_users
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_settings?key=eq.apasific_registered_users&select=value`, { headers: HEADERS });
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (row && row.value) {
      const parsed = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      if (Array.isArray(parsed)) reviewers = parsed;
    }
  } catch (e) {
    console.warn('⚠️  system_settings tidak terbaca, fallback ke file JSON:', e.message);
  }

  // 2. Fallback: apasific_registered_users.json
  if (reviewers.length === 0) {
    const DATA_FILE = path.join(__dirname, '..', 'apasific_registered_users.json');
    if (!fs.existsSync(DATA_FILE)) {
      console.error('❌ Tidak ada sumber reviewer (system_settings & file JSON kosong)');
      process.exit(1);
    }
    reviewers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }

  // Filter: role reviewer, ada email, bukan dummy, dedup email
  const seen = new Set();
  const out = [];
  for (const u of reviewers) {
    if (!u) continue;
    const role = String(u.role || '').toLowerCase();
    if (role !== 'reviewer') continue;
    const email = normalizeEmail(u.email);
    if (!email) continue;
    if (email.includes('@apasific-dummy.com')) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    out.push({ ...u, email });
  }
  return out;
}

/** List all Supabase Auth users (paginated via admin API). */
async function listAuthUsers() {
  const all = [];
  let page = 0;
  for (;;) {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?per_page=1000&page=${page + 1}`,
      { headers: HEADERS }
    );
    const json = await res.json();
    const users = json.users || [];
    all.push(...users);
    if (users.length < 1000) break;
    page += 1;
  }
  return all;
}

/** Create a Supabase Auth user (Admin API). */
async function createAuthUser(email, password, fullName, metadata) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: 'reviewer', ...metadata }
    })
  });
  return res.json();
}

/** Upsert profile row preserving reviewer data. */
async function upsertProfile(userId, user) {
  const payload = {
    id:         userId,
    full_name:  user.full_name  || user.name  || 'Reviewer',
    email:      user.email,
    role:       'reviewer',
    phone:      user.phone_number || user.phone || null,
    university: user.university   || user.affiliation || user.institution || null,
    country:    user.country      || null,
    discipline: user.discipline   || user.field || null,
    orcid_id:   user.orcid_id     || null,
    status:     user.status       || 'Active',
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(payload)
  });
  return res;
}

/** Verify a reviewer can actually log in (email + ReviewerPassword123!). */
async function verifyLogin(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_ROLE_KEY },
    body: JSON.stringify({ email, password: DEFAULT_PASSWORD })
  });
  return { ok: res.ok, status: res.status, body: await res.json().catch(() => ({})) };
}

// ─── Report helpers ────────────────────────────────────────────────────────
const report = {
  total: 0,
  existingInAuth: 0,
  missingInAuth: 0,
  duplicates: [],
  created: [],
  skipped: [],
  failed: [],
  verifyPass: [],
  verifyFail: [],
  profileLinked: [],
  profileFailed: [],
};

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n==============================================');
  console.log('  REVIEWER MIGRATION → SUPABASE AUTH');
  console.log('  Mode:', MODE);
  console.log('==============================================');

  const reviewers = await readReviewers();
  report.total = reviewers.length;

  // Duplicate email detection within source
  const emailCount = {};
  for (const r of reviewers) {
    emailCount[r.email] = (emailCount[r.email] || 0) + 1;
  }
  for (const [email, count] of Object.entries(emailCount)) {
    if (count > 1) report.duplicates.push({ email, count });
  }

  console.log(`\n📋 Total reviewer (role=reviewer, dedup): ${report.total}`);
  console.log('Fetching existing Supabase Auth users...');

  const authUsers = await listAuthUsers();
  const authByEmail = new Map(authUsers.map(u => [normalizeEmail(u.email), u]));
  report.existingInAuth = authUsers.length;

  const missing = reviewers.filter(r => !authByEmail.has(r.email));
  report.missingInAuth = missing.length;

  // ── Verification mode ────────────────────────────────────────────────────
  if (MODE === 'VERIFY') {
    console.log(`\n🔐 Verifying login (${DEFAULT_PASSWORD}) untuk ${reviewers.length} reviewer...`);
for (const r of reviewers) {
      const { ok, status, body } = await verifyLogin(r.email);
      if (ok) {
        report.verifyPass.push(r.email);
      } else {
        // TEMP improved verify logging: capture exact status, error, error_code
        const errMsg = body?.error || body?.msg || body?.message || JSON.stringify(body);
        const errCode = body?.error_code || body?.code || '';
        report.verifyFail.push({ email: r.email, status, error: errMsg, error_code: errCode });
      }
    }
  } else if (MODE === 'DRY-RUN') {
    // ── Dry-run report (no writes) ─────────────────────────────────────────
    console.log('\n──────────────────────────────────────────────');
    console.log('  DRY-RUN REPORT (no changes made)');
    console.log('──────────────────────────────────────────────');
    console.log(`  Total reviewers found      : ${report.total}`);
    console.log(`  Already in auth.users      : ${report.existingInAuth}`);
    console.log(`  Missing (to be created)    : ${report.missingInAuth}`);
    console.log(`  Duplicate emails in source : ${report.duplicates.length}`);
    if (report.duplicates.length) {
      report.duplicates.forEach(d => console.log(`    • ${d.email} ×${d.count}`));
    }
    console.log(`\n  Default password akan dipakai : ${DEFAULT_PASSWORD}`);
    console.log('\n  Jalankan dengan:  node scripts/migrate-reviewers-to-auth.js --apply');
    console.log('  Untuk verifikasi: node scripts/migrate-reviewers-to-auth.js --verify');
  } else {
    // ── Apply mode ─────────────────────────────────────────────────────────
    console.log(`\n⚙️  Creating ${missing.length} missing reviewer auth.users...\n`);
    for (const user of missing) {
      const email = user.email;
      const fullName = user.full_name || user.name || 'Reviewer';
      const metadata = {
        university: user.university || user.affiliation || user.institution || null,
        country:    user.country || null,
        expertise:  user.expertise || user.field || user.discipline || null,
      };

      const result = await createAuthUser(email, DEFAULT_PASSWORD, fullName, metadata);

      if (result.id) {
        report.created.push({ email, id: result.id });
        report.skipped.push({ email, reason: 'created now' });
        // Link profile preserving reviewer data
        const pr = await upsertProfile(result.id, user);
        if (pr.ok || pr.status === 201 || pr.status === 200) {
          report.profileLinked.push({ email, id: result.id });
        } else {
          report.profileFailed.push({ email, reason: `profile HTTP ${pr.status}` });
        }
        process.stdout.write('+');
      } else {
        const reason = result.msg || result.message || result.error || JSON.stringify(result);
        report.failed.push({ email, reason });
        if (report.failed.length === 1) {
          console.log('\n\n⚠️  FIRST FAILURE DETAIL:');
          console.log('  Email   :', email);
          console.log('  Response:', JSON.stringify(result, null, 2));
          console.log('');
        }
        process.stdout.write('F');
      }
    }

    // Also (re)link profiles for existing auth.users that have no profile or
    // need role=reviewer — idempotent upsert (merge-duplicates).
    console.log('\n\n🔗 Ensuring profiles for all reviewers (idempotent upsert)...');
    for (const r of reviewers) {
      const auth = authByEmail.get(r.email);
      if (!auth) continue; // missing (handled above or failed)
      const pr = await upsertProfile(auth.id, r);
      if (pr.ok || pr.status === 201 || pr.status === 200) {
        report.skipped.push({ email: r.email, reason: 'already existed — profile ensured' });
      }
    }
  }

  // ── Final report (all modes) ─────────────────────────────────────────────
  console.log('\n\n==============================================');
  console.log(`  FINAL REPORT — ${MODE}`);
  console.log('==============================================');
  console.log(`  Total reviewers            : ${report.total}`);
  console.log(`  Existing in auth.users     : ${report.existingInAuth}`);
  console.log(`  Missing in auth.users      : ${report.missingInAuth}`);
  if (MODE === 'APPLY') {
    console.log(`  ✅ Created auth accounts   : ${report.created.length}`);
    console.log(`  ⏭️  Skipped (existing/now) : ${report.skipped.length}`);
    console.log(`  ❌ Failed                 : ${report.failed.length}`);
    console.log(`  🔗 Profile linked         : ${report.profileLinked.length}`);
    console.log(`  ⚠️  Profile failed        : ${report.profileFailed.length}`);
  } else if (MODE === 'VERIFY') {
    console.log(`  ✅ Login OK (${DEFAULT_PASSWORD}) : ${report.verifyPass.length}`);
    console.log(`  ❌ Login failed           : ${report.verifyFail.length}`);
  }

  if (report.failed.length) {
    console.log('\n--- FAILED ---');
    report.failed.forEach(f => console.log(`  ✗ ${f.email} → ${f.reason}`));
  }
  if (MODE === 'VERIFY' && report.verifyFail.length) {
    console.log('\n--- LOGIN FAILED ---');
    report.verifyFail.forEach(f => console.log(`  ✗ ${f.email} → ${f.reason}`));
  }
  console.log(`\n  Default password: ${DEFAULT_PASSWORD}`);
  console.log('==============================================\n');
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
