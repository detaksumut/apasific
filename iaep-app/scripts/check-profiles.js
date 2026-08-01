// Cek apakah user-user JSON ada di profiles table
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
const HEADERS = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };

async function check() {
  // Cek beberapa email spesifik di profiles
  const emails = [
    'parida@apasific.org',
    'ekocmayndarto@gmail.com',
    'kadinmedan1@gmail.com',
    'kun@apasific.org',
    'rizky@apasific.org',
    'danil@apasific.org',
  ];

  console.log('=== PROFILES TABLE CHECK ===\n');
  
  for (const email of emails) {
    const res = await fetch(
      `${URL}/rest/v1/profiles?email=ilike.${encodeURIComponent(email)}&select=id,full_name,email,role,status`,
      { headers: HEADERS }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      console.log(`✅ ${email}`);
      console.log(`   id   : ${data[0].id}`);
      console.log(`   role : ${data[0].role}`);
      console.log(`   status: ${data[0].status}`);
    } else {
      console.log(`❌ ${email} — NOT IN PROFILES`);
    }
  }

  // Total profiles
  const totalRes = await fetch(`${URL}/rest/v1/profiles?select=id`, { headers: { ...HEADERS, 'Prefer': 'count=exact', 'Range': '0-0' } });
  const countHeader = totalRes.headers.get('content-range');
  console.log(`\nTotal profiles: ${countHeader || 'unknown'}`);
}

check().catch(console.error);
