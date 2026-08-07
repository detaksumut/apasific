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

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ============================================================
// CRITICAL SYSTEM USERS — APASIFIC JOURNAL SYSTEM
// Semua akun ini adalah pengguna inti dalam siklus jurnal.
// ============================================================
const SYSTEM_USERS = [
  {
    email: 'detaksumut@gmail.com',
    password: 'Mikr@210669Mpi',
    full_name: 'Super Administrator',
    role: 'super_admin',
  },
  {
    email: 'kadinmedan1@gmail.com',
    password: 'mikrosistem',
    full_name: 'Editor APASIFIC',
    role: 'editor',
  },
  {
    email: 'kun@apasific.org',
    password: 'mikrosistem',
    full_name: 'Kun (Production Team)',
    role: 'editor',
  },
  {
    email: 'rizky@apasific.org',
    password: 'mikrosistem',
    full_name: 'Rizky (Production Team)',
    role: 'editor',
  },
  {
    email: 'parida@apasific.org',
    password: 'mikrosistem',
    full_name: 'Parida (Production Team)',
    role: 'editor',
  },
  {
    email: 'danil@apasific.org',
    password: 'mikrosistem',
    full_name: 'Danil (Production Team)',
    role: 'editor',
  },
  {
    email: 'kadsumut@gmail.com',
    password: 'mikrosistem',
    full_name: 'Reviewer APASIFIC',
    role: 'reviewer',
  },
];

async function provisionUser(user) {
  console.log(`\n[${user.email}]`);

  // --- Step 1: Check if user exists in auth.users ---
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) {
    console.log(`  ❌ Could not list users: ${listErr.message}`);
    return;
  }

  let authUser = listData.users.find(u => u.email === user.email);

  if (!authUser) {
    // --- Step 2: Create user in Supabase Auth ---
    console.log(`  ➕ Creating in auth.users...`);
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // auto-confirm email
    });

    if (createErr) {
      console.log(`  ❌ Failed to create: ${createErr.message}`);
      return;
    }
    authUser = created.user;
    console.log(`  ✅ Created in auth.users — ID: ${authUser.id}`);
  } else {
    console.log(`  ✅ Exists in auth.users — ID: ${authUser.id}`);

    // --- Step 3: Ensure password matches (update if needed) ---
    const { error: updateErr } = await admin.auth.admin.updateUserById(authUser.id, {
      password: user.password,
      email_confirm: true,
    });
    if (updateErr) {
      console.log(`  ⚠️  Could not sync password: ${updateErr.message}`);
    } else {
      console.log(`  🔑 Password synced.`);
    }
  }

  // --- Step 4: Ensure profile exists in profiles table ---
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (!existingProfile) {
    const { error: insertErr } = await admin
      .from('profiles')
      .insert({
        id: authUser.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: 'Active',
      });

    if (insertErr) {
      console.log(`  ⚠️  Could not create profile row: ${insertErr.message}`);
    } else {
      console.log(`  ✅ Profile row created — role: ${user.role}`);
    }
  } else {
    // Update role to ensure it's correct
    const { error: updProfErr } = await admin
      .from('profiles')
      .update({ role: user.role, status: 'Active', full_name: user.full_name })
      .eq('id', authUser.id);

    if (updProfErr) {
      console.log(`  ⚠️  Could not update profile: ${updProfErr.message}`);
    } else {
      console.log(`  ✅ Profile row OK — role: ${existingProfile.role} → ${user.role}`);
    }
  }
}

async function run() {
  console.log("=======================================================");
  console.log("APASIFIC SYSTEM USER PROVISIONING");
  console.log("=======================================================");
  console.log("Memastikan seluruh akun inti sistem tersedia di Supabase");
  console.log("Auth dan tabel profiles dengan role yang benar.\n");

  for (const user of SYSTEM_USERS) {
    await provisionUser(user);
  }

  console.log("\n=======================================================");
  console.log("PROVISIONING SELESAI");
  console.log("=======================================================");
  console.log("\nRingkasan akun sistem:");
  console.log("  super_admin  : detaksumut@gmail.com");
  console.log("  editor       : kadinmedan1@gmail.com");
  console.log("  editor       : kun@apasific.org");
  console.log("  editor       : rizky@apasific.org");
  console.log("  editor       : parida@apasific.org");
  console.log("  editor       : danil@apasific.org");
  console.log("  reviewer     : kadsumut@gmail.com");
  console.log("\nSemua akun sudah dikonfirmasi email-nya secara otomatis.");
  console.log("Silakan coba login kembali di https://www.apasific.org/auth/login");
}

run();
