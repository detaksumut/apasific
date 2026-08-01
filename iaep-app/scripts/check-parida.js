// Quick diagnostic: cek data parida di Supabase system_settings vs local JSON
const fs   = require('fs');
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

async function check() {
  const TARGET = 'parida@apasific.org';

  // 1. Cek di local JSON
  const localFile = path.join(__dirname, '..', 'apasific_registered_users.json');
  const localUsers = JSON.parse(fs.readFileSync(localFile, 'utf8'));
  const localUser = localUsers.find(u => u.email?.toLowerCase() === TARGET);
  console.log('=== LOCAL JSON ===');
  console.log('Found:', !!localUser);
  if (localUser) console.log('Password in JSON:', localUser.password ? `"${localUser.password}"` : '(EMPTY/MISSING)');

  // 2. Cek di Supabase system_settings
  const res = await fetch(`${URL}/rest/v1/system_settings?key=eq.apasific_registered_users&select=value`, {
    headers: { ...HEADERS, 'Accept': 'application/json' }
  });
  const rows = await res.json();
  console.log('\n=== SUPABASE system_settings ===');
  if (rows && rows[0] && rows[0].value) {
    const sbUsers = Array.isArray(rows[0].value) ? rows[0].value : JSON.parse(rows[0].value);
    const sbUser = sbUsers.find(u => u.email?.toLowerCase() === TARGET);
    console.log('Found in Supabase:', !!sbUser);
    if (sbUser) console.log('Password in Supabase:', sbUser.password ? `"${sbUser.password}"` : '(EMPTY/MISSING)');
  } else {
    console.log('system_settings not found or empty');
  }

  // 3. Cek apakah ada di Supabase Auth
  const authRes = await fetch(`${URL}/auth/v1/admin/users?per_page=1000`, { headers: HEADERS });
  const authData = await authRes.json();
  const authUsers = authData.users || [];
  const authUser = authUsers.find(u => u.email?.toLowerCase() === TARGET);
  console.log('\n=== SUPABASE AUTH ===');
  console.log('Exists in Auth:', !!authUser);
  if (authUser) console.log('Auth ID:', authUser.id);
}

check().catch(console.error);
