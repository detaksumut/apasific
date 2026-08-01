// Cek detail danil di JSON, Supabase system_settings, profiles, dan Auth
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...rest] = line.split('=');
    process.env[key.trim()] = rest.join('=').trim();
  }
});

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HEADERS = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const TARGET = 'danil@apasific.org';

async function check() {
  // 1. JSON lokal
  const localUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'apasific_registered_users.json'), 'utf8'));
  const local = localUsers.find(u => u.email?.toLowerCase() === TARGET);
  console.log('=== LOCAL JSON ===');
  console.log('Found:', !!local);
  if (local) {
    console.log('id      :', local.id);
    console.log('password:', local.password ? `"${local.password}"` : '(MISSING)');
    console.log('role    :', local.role);
    console.log('full_name:', local.full_name);
    // Check for special chars
    if (local.full_name) {
      const codes = [...local.full_name].map(c => c.charCodeAt(0));
      const hasSpecial = codes.some(c => c > 127);
      console.log('special chars in name:', hasSpecial, codes);
    }
  }

  // 2. Profiles table
  const res = await fetch(
    `${URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(TARGET)}&select=id,full_name,email,role`,
    { headers: HEADERS }
  );
  const profiles = await res.json();
  console.log('\n=== PROFILES TABLE ===');
  console.log('Found:', profiles?.length);
  if (profiles?.length > 0) console.log(JSON.stringify(profiles[0], null, 2));

  // 3. Supabase Auth users list (GET)
  const authRes = await fetch(`${URL}/auth/v1/admin/users?per_page=1000`, { headers: HEADERS });
  const authRaw = await authRes.json();
  const authUsers = authRaw?.users || [];
  const authUser = authUsers.find(u => u.email?.toLowerCase() === TARGET);
  console.log('\n=== SUPABASE AUTH ===');
  console.log('Exists in Auth:', !!authUser);
  console.log('Total Auth users listed:', authUsers.length);
  if (authUser) console.log('Auth ID:', authUser.id, '| created:', authUser.created_at);

  // 4. Try signInWithPassword to see what error we get
  console.log('\n=== SIMULATE signInWithPassword ===');
  const signInRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { ...HEADERS, 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    body: JSON.stringify({ email: TARGET, password: 'mikrosistem' })
  });
  const signInData = await signInRes.json();
  console.log('Status:', signInRes.status);
  if (signInData.error) console.log('Error:', signInData.error, '|', signInData.error_description);
  if (signInData.access_token) console.log('Login SUCCESS — has access_token');
}

check().catch(console.error);
