global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function run() {
  // Check what roles are used by existing profiles
  console.log("── Distinct roles in profiles table:");
  const { data: roles } = await supabase
    .from('profiles')
    .select('role')
    .limit(200);

  const distinct = [...new Set(roles?.map(r => r.role))];
  console.log("Valid roles found:", distinct);

  // Check detaksumut profile
  console.log("\n── Profile detaksumut@gmail.com:");
  const { data: p } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', 'detaksumut@gmail.com')
    .maybeSingle();
  console.log(p || "NOT FOUND");

  // Check auth user
  console.log("\n── Auth user detaksumut@gmail.com:");
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const au = listData?.users?.find(u => u.email === 'detaksumut@gmail.com');
  console.log(au ? `ID: ${au.id}, confirmed: ${!!au.email_confirmed_at}` : "NOT FOUND");

  // Try creating profile with each valid role
  if (!p && au) {
    console.log("\n── Mencoba buat profile dengan role 'admin'...");
    const { error: e1 } = await supabase.from('profiles').insert({
      id: au.id,
      email: 'detaksumut@gmail.com',
      full_name: 'Super Administrator',
      role: 'admin',
      status: 'Active',
    });
    if (e1) {
      console.log(`   ❌ 'admin' gagal: ${e1.message}`);
      
      // Try other common values
      for (const tryRole of ['super_admin', 'superadmin', 'ADMIN', 'Super Admin']) {
        const { error: e2 } = await supabase.from('profiles').upsert({
          id: au.id,
          email: 'detaksumut@gmail.com',
          full_name: 'Super Administrator',
          role: tryRole,
          status: 'Active',
        }, { onConflict: 'id' });
        if (!e2) {
          console.log(`   ✅ Berhasil dengan role: '${tryRole}'`);
          break;
        } else {
          console.log(`   ❌ '${tryRole}' gagal: ${e2.message}`);
        }
      }
    } else {
      console.log(`   ✅ Profile berhasil dibuat dengan role 'admin'`);
    }
  }

  // Final state
  console.log("\n── Status akhir:");
  const { data: finalProfile } = await supabase
    .from('profiles')
    .select('id, email, role, full_name')
    .ilike('email', 'detaksumut@gmail.com')
    .maybeSingle();
  console.log(finalProfile || "Profile masih tidak ada");
}

run();
