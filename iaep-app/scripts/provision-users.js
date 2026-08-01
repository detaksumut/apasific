/**
 * APASIFIC IAEEA — Academic User Provisioning Script
 * 
 * Classification: Infrastructure Data Migration (NOT Authentication Refactor)
 * Change Request: Authentication Recovery — Opsi A
 * 
 * Menggunakan Supabase Admin REST API langsung (tanpa @supabase/supabase-js)
 * untuk menghindari masalah WebSocket di Node.js 20.
 * 
 * Aturan: Script ini TIDAK mengubah auth.ts, middleware, session, atau routing.
 */

const fs   = require('fs');
const path = require('path');

// ─── Load .env.local ─────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...rest] = line.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
});

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: SUPABASE env vars tidak ditemukan di .env.local');
  process.exit(1);
}

const HEADERS = {
  'apikey':        SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type':  'application/json',
};

// ─── Supabase Admin REST helpers ─────────────────────────

async function listAuthUsers() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=1000`, { headers: HEADERS });
  const json = await res.json();
  return json.users || [];
}

async function createAuthUser(email, password, fullName, role) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role }
    })
  });
  return res.json();
}

async function upsertProfile(userId, user) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify({
      id:          userId,
      full_name:   user.full_name || 'User',
      email:       user.email.toLowerCase().trim(),
      role:        user.role || 'author',
      phone:       user.phone_number || null,
      university:  user.university  || null,
      country:     user.country     || null,
      discipline:  user.discipline  || null,
      orcid_id:    user.orcid_id    || null,
      status:      user.status      || 'Active',
    })
  });
}

// ─── Main ─────────────────────────────────────────────────

async function provision() {
  const DATA_FILE = path.join(__dirname, '..', 'apasific_registered_users.json');
  if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ File tidak ditemukan:', DATA_FILE);
    process.exit(1);
  }

  const allUsers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  // Filter: buang dummy email & duplikat
  const seen = new Set();
  const users = allUsers.filter(u => {
    if (!u.email) return false;
    const email = u.email.toLowerCase().trim();
    if (email.includes('@apasific-dummy.com')) return false;
    if (seen.has(email)) return false;
    seen.add(email);
    return true;
  });

  console.log('\n========================================');
  console.log('  APASIFIC — USER PROVISIONING REPORT   ');
  console.log('========================================');
  console.log(`User registry (filtered): ${users.length}`);
  console.log('Fetching existing Supabase Auth users...');

  // Ambil semua user yang sudah ada
  const existingUsers = await listAuthUsers();
  const existingEmails = new Set(existingUsers.map(u => u.email?.toLowerCase()));
  console.log(`Existing Supabase Auth users: ${existingEmails.size}`);
  console.log('\nStarting provisioning... (+: Created, .: Skipped, F: Failed)\n');

  const report = { total: users.length, created: [], skipped: [], failed: [] };

  for (const user of users) {
    const email    = user.email.toLowerCase().trim();
    const password = (user.password && user.password.length >= 6) ? user.password : 'APASIFIC2026!';
    const fullName = user.full_name || 'User';
    const role     = user.role || 'author';

    if (existingEmails.has(email)) {
      report.skipped.push({ email, reason: 'Already in Supabase Auth' });
      process.stdout.write('.');
      continue;
    }

    const result = await createAuthUser(email, password, fullName, role);

    if (result.id) {
      await upsertProfile(result.id, user);
      report.created.push({ email, role });
      process.stdout.write('+');
    } else {
      const reason = result.msg || result.message || result.error || JSON.stringify(result);
      report.failed.push({ email, reason });
      // Print first failure in detail for diagnosis
      if (report.failed.length === 1) {
        console.log('\n\n⚠️  FIRST FAILURE DETAIL:');
        console.log('  Email :', email);
        console.log('  Response:', JSON.stringify(result, null, 2));
        console.log('');
      }
      process.stdout.write('F');
    }
  }

  // ─── Final Report ──────────────────────────────────────
  console.log('\n\n========================================');
  console.log('        PROVISIONING COMPLETE           ');
  console.log('========================================');
  console.log(`Total Diproses : ${report.total}`);
  console.log(`✅ Created     : ${report.created.length}`);
  console.log(`⏭️  Skipped     : ${report.skipped.length} (sudah ada)`);
  console.log(`❌ Failed      : ${report.failed.length}`);

  if (report.created.length > 0) {
    console.log('\n--- NEWLY CREATED ---');
    report.created.forEach(u => console.log(`  + [${u.role}] ${u.email}`));
  }

  if (report.failed.length > 0) {
    console.log('\n--- FAILED ---');
    report.failed.forEach(u => console.log(`  ✗ ${u.email} → ${u.reason}`));
  }

  console.log('\n--- PASSWORD DEFAULT (jika tidak ada di JSON) ---');
  console.log('  APASIFIC2026!');
  console.log('========================================\n');
}

provision().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
