/**
 * READ-ONLY audit: profiles.role analysis
 * No writes. No mutations. SELECT only.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aroasmlrlpjbjokvxlgo.supabase.co';
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// RBAC admin roles (mirrors isAdminRole in src/lib/roles.ts)
const ADMIN_NORMALIZED = new Set(['SUPER_ADMIN', 'ADMIN']);
const ROLE_MAP = {
  'super_admin':  'SUPER_ADMIN',
  'superadmin':   'SUPER_ADMIN',
  'admin':        'ADMIN',
  'co_admin':     'ADMIN',
  'co-admin':     'ADMIN',
  'editor':       'EDITOR',
  'reviewer':     'REVIEWER',
  'layout editor':'PRODUCTION',
  'cover editor': 'PRODUCTION',
  'publish editor':'PRODUCTION',
  'admin editor': 'PRODUCTION',
};

function normalize(raw) {
  if (!raw) return null;
  const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  return ROLE_MAP[key] || null;
}

function isAdminRole(raw) {
  const n = normalize(raw);
  return ADMIN_NORMALIZED.has(n);
}

// ── 1. Fetch ALL profiles ──────────────────────────────────────────────────
const { data: profiles, error } = await supabase
  .from('profiles')
  .select('id, email, full_name, role, status')
  .order('role', { ascending: true });

if (error) {
  console.error('ERROR fetching profiles:', error.message);
  process.exit(1);
}

const total = profiles.length;

// ── 2. NULL / empty role breakdown ────────────────────────────────────────
const nullRoleRows    = profiles.filter(p => p.role === null || p.role === undefined);
const emptyRoleRows   = profiles.filter(p => p.role !== null && p.role !== undefined && p.role.trim() === '');
const missingRoleRows = [...nullRoleRows, ...emptyRoleRows];

// ── 3. Distinct roles ─────────────────────────────────────────────────────
const roleFreq = {};
for (const p of profiles) {
  const r = (p.role ?? '').trim() || '(NULL/empty)';
  roleFreq[r] = (roleFreq[r] || 0) + 1;
}

// ── 4. Authorization risk ─────────────────────────────────────────────────
const unknownRoleRows = profiles.filter(p => {
  if (!p.role || p.role.trim() === '') return false;
  return normalize(p.role) === null;
});

const adminRows = profiles.filter(p => isAdminRole(p.role));

// Active/Approved users with missing role — cannot be authorized even if Fix A is applied
const missingActiveRows = missingRoleRows.filter(p => {
  const s = (p.status || '').toLowerCase();
  return s === 'active' || s === 'approved';
});

// ── 5. Print report ───────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════');
console.log('  profiles.role AUDIT REPORT (READ-ONLY)');
console.log('══════════════════════════════════════════════════\n');

console.log(`Total profiles rows:               ${total}`);
console.log(`Rows where role IS NULL:           ${nullRoleRows.length}`);
console.log(`Rows where role IS empty string:   ${emptyRoleRows.length}`);
console.log(`Rows with missing role (combined): ${missingRoleRows.length}`);
console.log(`Rows with UNKNOWN role string:     ${unknownRoleRows.length}`);
console.log(`Rows confirmed admin/super_admin:  ${adminRows.length}\n`);

console.log('── DISTINCT ROLE VALUES ─────────────────────────────');
const sorted = Object.entries(roleFreq).sort((a,b) => b[1]-a[1]);
for (const [role, count] of sorted) {
  const norm = normalize(role === '(NULL/empty)' ? null : role) ?? '⚠ UNMAPPED';
  console.log(`  ${String(count).padStart(4)}x  "${role}"  →  ${norm}`);
}

console.log('\n── CONFIRMED ADMIN USERS ────────────────────────────');
if (adminRows.length === 0) {
  console.log('  (none found)');
} else {
  for (const p of adminRows) {
    console.log(`  id=${p.id}  email=${p.email}  role="${p.role}"  status=${p.status}`);
  }
}

console.log('\n── ACTIVE/APPROVED USERS WITH MISSING ROLE (at risk) ──');
if (missingActiveRows.length === 0) {
  console.log('  (none — no active/approved users have a missing role)');
} else {
  for (const p of missingActiveRows) {
    console.log(`  ⚠  id=${p.id}  email=${p.email}  status=${p.status}  role=NULL`);
  }
}

console.log('\n── UNKNOWN ROLE STRINGS (set but unmappable) ────────');
if (unknownRoleRows.length === 0) {
  console.log('  (none)');
} else {
  for (const p of unknownRoleRows) {
    console.log(`  ⚠  id=${p.id}  email=${p.email}  role="${p.role}"  status=${p.status}`);
  }
}

console.log('\n══════════════════════════════════════════════════');
console.log('  END OF REPORT — NO DATA WAS MODIFIED');
console.log('══════════════════════════════════════════════════\n');
