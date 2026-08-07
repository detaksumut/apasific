// Polyfill WebSocket for Node.js < 22
global.WebSocket = require('ws');

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env.local
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const TARGET_EMAIL = 'kadsumut@gmail.com';

async function diagnose() {
  console.log("==========================================================");
  console.log(" DIAGNOSIS REVIEW DATA — APASIFIC IAEP");
  console.log(`  Target Reviewer : ${TARGET_EMAIL}`);
  console.log("==========================================================\n");

  // ── STEP 1: Resolve reviewer profile ID ──────────────────────────────────
  console.log("── [1] Mencari profile ID reviewer di tabel profiles...");
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, full_name, role, email, status')
    .eq('email', TARGET_EMAIL)
    .maybeSingle();

  if (pErr || !profile) {
    console.log(`   ❌ Profile TIDAK DITEMUKAN di tabel profiles: ${pErr?.message || 'No data'}`);
    console.log("   → Kemungkinan: script provision-system-users.js belum dijalankan,");
    console.log("     atau email berbeda dengan yang tercatat di DB.");
  } else {
    console.log(`   ✅ Profile ditemukan:`);
    console.log(`      ID     : ${profile.id}`);
    console.log(`      Nama   : ${profile.full_name}`);
    console.log(`      Role   : ${profile.role}`);
    console.log(`      Status : ${profile.status}`);
  }

  // ── STEP 2: Check Supabase Auth user ─────────────────────────────────────
  console.log("\n── [2] Memeriksa akun Supabase Auth...");
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const authUser = listData?.users?.find(u => u.email === TARGET_EMAIL);

  if (!authUser) {
    console.log("   ❌ User TIDAK ADA di auth.users — belum pernah login / belum terdaftar di Supabase Auth");
    console.log("   → Solusi: Jalankan node scripts/provision-system-users.js");
  } else {
    console.log(`   ✅ Auth user ditemukan — ID: ${authUser.id}`);
    console.log(`      Email confirmed : ${authUser.email_confirmed_at ? 'YES' : 'NO'}`);
    console.log(`      Last login      : ${authUser.last_sign_in_at || 'Belum pernah'}`);
    
    if (profile && profile.id !== authUser.id) {
      console.log(`\n   ⚠️  ID MISMATCH TERDETEKSI!`);
      console.log(`      Profile ID (profiles table) : ${profile.id}`);
      console.log(`      Auth UID (auth.users)        : ${authUser.id}`);
      console.log("      → Ini adalah ROOT CAUSE utama data hilang!");
      console.log("        review_assignments mencari reviewer_id = auth UID,");
      console.log("        tapi profile ID berbeda sehingga tidak ada yang cocok.");
    }
  }

  const reviewerId = profile?.id || authUser?.id;

  // ── STEP 3: Semua review_assignments untuk reviewer ini ──────────────────
  console.log("\n── [3] Seluruh review_assignments di Supabase...");

  // By profile ID
  const { data: byId, error: byIdErr } = await supabase
    .from('review_assignments')
    .select('id, submission_id, reviewer_id, reviewer_email, status, recommendation, assigned_at, completed_at, deadline')
    .eq('reviewer_id', reviewerId || '');

  // By email (legacy rows)
  const { data: byEmail, error: byEmailErr } = await supabase
    .from('review_assignments')
    .select('id, submission_id, reviewer_id, reviewer_email, status, recommendation, assigned_at, completed_at, deadline')
    .eq('reviewer_email', TARGET_EMAIL);

  const allById = byId || [];
  const allByEmail = byEmail || [];

  // Merge & deduplicate
  const seen = new Set();
  const allAssignments = [];
  for (const r of [...allById, ...allByEmail]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      allAssignments.push(r);
    }
  }

  console.log(`   Total by reviewer_id (${reviewerId})  : ${allById.length}`);
  console.log(`   Total by reviewer_email               : ${allByEmail.length}`);
  console.log(`   Total unique (merged)                 : ${allAssignments.length}\n`);

  if (allAssignments.length === 0) {
    console.log("   ❌ TIDAK ADA data review_assignments sama sekali di Supabase untuk reviewer ini!");
  } else {
    console.log("   Detail semua assignment:");
    allAssignments.forEach((a, i) => {
      console.log(`\n   [${i + 1}] ID: ${a.id}`);
      console.log(`        submission_id  : ${a.submission_id}`);
      console.log(`        reviewer_id    : ${a.reviewer_id}`);
      console.log(`        reviewer_email : ${a.reviewer_email}`);
      console.log(`        status         : ${a.status}`);
      console.log(`        recommendation : ${a.recommendation || '-'}`);
      console.log(`        assigned_at    : ${a.assigned_at}`);
      console.log(`        completed_at   : ${a.completed_at || '-'}`);
    });
  }

  // ── STEP 4: Statistik per status ────────────────────────────────────────
  console.log("\n── [4] Statistik berdasarkan status...");
  const statusCount = {};
  allAssignments.forEach(a => {
    statusCount[a.status] = (statusCount[a.status] || 0) + 1;
  });
  console.table(statusCount);

  // ── STEP 5: Cek submission detail untuk semua assignment ────────────────
  if (allAssignments.length > 0) {
    console.log("\n── [5] Judul artikel dari setiap assignment...");
    for (const a of allAssignments) {
      const { data: sub } = await supabase
        .from('submissions')
        .select('id, title, status, journal_id')
        .eq('id', a.submission_id)
        .maybeSingle();

      if (!sub) {
        console.log(`   ⚠️  submission_id ${a.submission_id} → TIDAK ADA di tabel submissions (data orphan/dihapus?)`);
      } else {
        console.log(`   ✅ [${a.status}] "${sub.title}" (submission status: ${sub.status})`);
      }
    }
  }

  // ── STEP 6: GLOBAL — Berapa total review_assignments yang orphan ─────────
  console.log("\n── [6] AUDIT GLOBAL: Semua review_assignments di sistem...");
  const { data: allSysAssignments } = await supabase
    .from('review_assignments')
    .select('id, reviewer_id, reviewer_email, status, submission_id');

  const total = allSysAssignments?.length || 0;
  console.log(`   Total semua review_assignments di Supabase: ${total}`);

  if (allSysAssignments) {
    // Find assignments with no matching submission
    let orphanCount = 0;
    let noReviewerIdCount = 0;
    
    for (const a of allSysAssignments) {
      if (!a.reviewer_id) noReviewerIdCount++;
    }

    const statusSummary = {};
    allSysAssignments.forEach(a => {
      statusSummary[a.status] = (statusSummary[a.status] || 0) + 1;
    });

    console.log(`   Assignment tanpa reviewer_id (hanya email): ${noReviewerIdCount}`);
    console.log("\n   Status summary seluruh sistem:");
    console.table(statusSummary);
  }

  console.log("\n==========================================================");
  console.log(" DIAGNOSIS SELESAI");
  console.log("==========================================================");
  console.log("\nKemungkinan Root Cause berdasarkan hasil di atas:");
  console.log(" 1. ID MISMATCH: profile.id !== auth.id → query review_assignments gagal match");
  console.log(" 2. Data HANYA di Firestore, belum disync ke Supabase");
  console.log(" 3. reviewer_email tidak terisi di kolom review_assignments");
  console.log(" 4. Data orphan: submission dihapus tapi assignment masih ada");
}

diagnose();
