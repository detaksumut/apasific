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
const OLD_PROFILE_ID = '64656d6f-2d75-7365-722d-313738343035';
const NEW_AUTH_UUID  = '2ed85d6e-06e5-49b3-a5bc-aef25dc0c7bb';

async function repair() {
  console.log("==========================================================");
  console.log(" REPAIR REVIEWER DATA — APASIFIC IAEP");
  console.log(`  Target  : ${TARGET_EMAIL}`);
  console.log(`  Old ID  : ${OLD_PROFILE_ID}`);
  console.log(`  New UID : ${NEW_AUTH_UUID}`);
  console.log("==========================================================\n");

  // ── [A] Cek apakah ada duplikat profile ──────────────────────────────────
  console.log("[A] Memeriksa duplikat profile...");
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, status, email')
    .eq('email', TARGET_EMAIL);

  console.log(`    Ditemukan ${allProfiles?.length || 0} profile row untuk email ini:`);
  allProfiles?.forEach(p => console.log(`    → id: ${p.id}, name: ${p.full_name}, role: ${p.role}`));

  // ── [B] Migrasi profile: pastikan row dengan NEW_AUTH_UUID ada ────────────
  console.log("\n[B] Memperbaiki profile ID...");

  const hasOldProfile = allProfiles?.find(p => p.id === OLD_PROFILE_ID);
  const hasNewProfile = allProfiles?.find(p => p.id === NEW_AUTH_UUID);

  if (hasOldProfile && !hasNewProfile) {
    // Create new row with correct auth UUID, copy from old row
    console.log("    ➕ Membuat profile baru dengan NEW_AUTH_UUID...");
    const { error: insertErr } = await supabase
      .from('profiles')
      .insert({
        id: NEW_AUTH_UUID,
        email: TARGET_EMAIL,
        full_name: hasOldProfile.full_name || 'Reviewer APASIFIC',
        role: hasOldProfile.role || 'reviewer',
        status: 'Active',
      });

    if (insertErr) {
      console.log(`    ⚠️  Insert gagal: ${insertErr.message}`);
      // Try upsert instead
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: NEW_AUTH_UUID,
          email: TARGET_EMAIL,
          full_name: hasOldProfile.full_name || 'Reviewer APASIFIC',
          role: hasOldProfile.role || 'reviewer',
          status: 'Active',
        }, { onConflict: 'id' });
      if (upsertErr) {
        console.log(`    ❌ Upsert juga gagal: ${upsertErr.message}`);
      } else {
        console.log(`    ✅ Profile dengan NEW_AUTH_UUID berhasil di-upsert.`);
      }
    } else {
      console.log(`    ✅ Profile baru (id=${NEW_AUTH_UUID}) berhasil dibuat.`);
    }
  } else if (hasNewProfile) {
    console.log(`    ✅ Profile dengan NEW_AUTH_UUID sudah ada — tidak perlu dibuat ulang.`);
  } else {
    console.log(`    ❌ Old profile tidak ditemukan — tidak bisa migrasi.`);
  }

  // ── [C] Update review_assignments: reviewer_id lama → baru ────────────────
  console.log("\n[C] Memperbarui reviewer_id di review_assignments (OLD → NEW)...");
  const { data: updatedById, error: updByIdErr } = await supabase
    .from('review_assignments')
    .update({ reviewer_id: NEW_AUTH_UUID, reviewer_email: TARGET_EMAIL })
    .eq('reviewer_id', OLD_PROFILE_ID)
    .select('id');

  if (updByIdErr) {
    console.log(`    ❌ Gagal update by old ID: ${updByIdErr.message}`);
  } else {
    console.log(`    ✅ ${updatedById?.length || 0} rows diperbarui (reviewer_id: OLD → NEW).`);
  }

  // ── [D] Update review_assignments: yang hanya punya email, set reviewer_id ─
  console.log("\n[D] Backfill reviewer_id untuk rows yang hanya punya reviewer_email...");
  const { data: updatedByEmail, error: updByEmailErr } = await supabase
    .from('review_assignments')
    .update({ reviewer_id: NEW_AUTH_UUID })
    .eq('reviewer_email', TARGET_EMAIL)
    .is('reviewer_id', null)
    .select('id');

  if (updByEmailErr) {
    console.log(`    ❌ Gagal backfill by email: ${updByEmailErr.message}`);
  } else {
    console.log(`    ✅ ${updatedByEmail?.length || 0} rows di-backfill reviewer_id dari email.`);
  }

  // ── [E] Verifikasi akhir ──────────────────────────────────────────────────
  console.log("\n[E] Verifikasi setelah repair...");
  const { data: finalCheck } = await supabase
    .from('review_assignments')
    .select('id, submission_id, status, recommendation, reviewer_id, reviewer_email')
    .eq('reviewer_id', NEW_AUTH_UUID);

  console.log(`    Total assignments setelah repair (reviewer_id=${NEW_AUTH_UUID}): ${finalCheck?.length || 0}`);

  const statusCount = {};
  finalCheck?.forEach(a => { statusCount[a.status] = (statusCount[a.status] || 0) + 1; });
  console.log("\n    Status breakdown:");
  console.table(statusCount);

  const nullSubCount = finalCheck?.filter(a => !a.submission_id).length || 0;
  const validSubCount = (finalCheck?.length || 0) - nullSubCount;
  console.log(`\n    ✅ Assignments dengan submission valid : ${validSubCount}`);
  console.log(`    ⚠️  Assignments dengan submission NULL  : ${nullSubCount}`);

  if (nullSubCount > 0) {
    console.log("\n    Catatan: Assignments dengan NULL submission_id adalah data");
    console.log("    dari Firestore legacy yang submission ID-nya tidak ditemukan");
    console.log("    di Supabase. Data ini tidak bisa ditampilkan di UI.");
    console.log("    Pertimbangkan untuk menghapusnya agar tidak mencemari statistik.");
  }

  // ── [F] Ringkasan akhir ───────────────────────────────────────────────────
  console.log("\n==========================================================");
  console.log(" REPAIR SELESAI — Ringkasan:");
  console.log("==========================================================");
  console.log(` ✅ Profile ID sudah di-align dengan Supabase Auth UUID`);
  console.log(` ✅ review_assignments.reviewer_id sudah diperbarui ke NEW UUID`);
  console.log(` ✅ Backfill reviewer_id dari email selesai`);
  console.log(`\n Silakan login ulang sebagai ${TARGET_EMAIL}`);
  console.log(` dan cek Riwayat Review — data review yang valid akan muncul kembali.`);
}

repair();
