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
} catch (e) {
  console.warn("Failed to parse .env.local:", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

// Admin client (service role — bypasses RLS)
const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'detaksumut@gmail.com';

async function diagnoseLogin() {
  console.log("=======================================================");
  console.log("LOGIN DIAGNOSTICS — APASIFIC IAEP");
  console.log(`Target Email : ${TARGET_EMAIL}`);
  console.log("=======================================================\n");

  // 1. Check Auth user existence
  const { data: listData, error: listErr } = await adminClient.auth.admin.listUsers();
  if (listErr) {
    console.error("ERROR: Could not list auth.users:", listErr.message);
    return;
  }

  const authUser = listData.users.find(u => u.email === TARGET_EMAIL);

  if (!authUser) {
    console.log("❌ RESULT: User NOT FOUND in auth.users");
    console.log("   → Akun belum pernah dibuat di Supabase Auth.");
    console.log("   → Solusi: User harus mendaftar dulu di /auth/register.");
    return;
  }

  console.log("✅ User DITEMUKAN di auth.users");
  console.log(`   ID              : ${authUser.id}`);
  console.log(`   Email           : ${authUser.email}`);
  console.log(`   Email Confirmed : ${authUser.email_confirmed_at ? '✅ YES — ' + authUser.email_confirmed_at : '❌ NO (belum konfirmasi email)'}`);
  console.log(`   Created At      : ${authUser.created_at}`);
  console.log(`   Last Sign In    : ${authUser.last_sign_in_at || 'Belum pernah login'}`);
  console.log(`   Banned Until    : ${authUser.banned_until || 'Tidak di-ban'}`);
  console.log(`   Provider        : ${authUser.app_metadata?.provider || 'email'}`);
  console.log(`   Role            : ${authUser.role || 'authenticated'}`);

  // 2. Check profile in profiles table
  const { data: profile, error: profileErr } = await adminClient
    .from('profiles')
    .select('*')
    .eq('email', TARGET_EMAIL)
    .maybeSingle();

  if (profileErr) {
    console.log(`\n❌ ERROR querying profiles table: ${profileErr.message}`);
  } else if (!profile) {
    console.log(`\n⚠️  WARNING: User ada di auth.users tapi TIDAK ADA di tabel profiles`);
    console.log(`   → Bisa menyebabkan error saat login jika ada trigger/RLS yang membutuhkan profiles.`);
  } else {
    console.log(`\n✅ Profile DITEMUKAN di tabel profiles`);
    console.log(`   Full Name : ${profile.full_name || '(kosong)'}`);
    console.log(`   Role      : ${profile.role || '(kosong)'}`);
    console.log(`   Status    : ${profile.status || '(kosong)'}`);
  }

  // 3. Try signing in with the given password to simulate
  console.log("\n-------------------------------------------------------");
  console.log("SIMULATION: Attempting Sign-In (Password Test)");
  console.log("-------------------------------------------------------");

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    console.log("⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY not found — skipping sign-in test.");
  } else {
    const anonClient = createClient(supabaseUrl, anonKey);
    const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: TARGET_EMAIL,
      password: 'Mikr@210669Mpi'
    });

    if (signInErr) {
      console.log(`❌ SIGN-IN FAILED: ${signInErr.message}`);
      console.log(`   Status Code : ${signInErr.status || 'N/A'}`);

      // Detailed analysis
      const msg = signInErr.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        console.log("\n📋 ROOT CAUSE ANALYSIS:");
        console.log("   Password yang dimasukkan TIDAK COCOK dengan hash password di Supabase Auth.");
        console.log("   Kemungkinan penyebab:");
        console.log("   1. Password pernah diubah oleh user dan password saat ini berbeda.");
        console.log("   2. Akun dibuat menggunakan metode lain (Google/ORCID OAuth), bukan email+password.");
        console.log("   3. Typo pada password saat registrasi.");
        console.log(`\n   Provider terdaftar: ${authUser.app_metadata?.provider || 'email'}`);
        if (authUser.app_metadata?.provider !== 'email') {
          console.log(`\n   ⚠️  PENTING: Akun ini dibuat via OAuth (${authUser.app_metadata?.provider}), bukan email/password.`);
          console.log("   → Login dengan email+password tidak akan bisa kecuali user set password dulu.");
        }
      } else if (msg.includes('email not confirmed')) {
        console.log("\n📋 ROOT CAUSE ANALYSIS:");
        console.log("   Email belum dikonfirmasi. User harus klik link konfirmasi di email mereka.");
      } else if (msg.includes('user not found')) {
        console.log("\n📋 ROOT CAUSE ANALYSIS:");
        console.log("   Akun tidak ditemukan (berbeda dengan temuan admin.listUsers — cek inkonsistensi data).");
      }
    } else {
      console.log("✅ SIGN-IN BERHASIL!");
      console.log(`   User ID: ${signInData.user?.id}`);
      console.log("   Password yang diberikan sudah benar. Masalah mungkin ada di frontend/UI.");
    }
  }

  console.log("\n=======================================================");
  console.log("DIAGNOSIS SELESAI");
  console.log("=======================================================");
}

diagnoseLogin();
