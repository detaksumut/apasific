// Cek password reviewer UUM di system_settings vs local JSON
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

const TARGETS = ['ezah@uum.edu.my', 'arifatul@uum.edu.my', 'aidi@uum.edu.my'];

async function check() {
  // Local JSON
  const localUsers = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'apasific_registered_users.json'), 'utf8'));
  
  // Supabase system_settings
  const res = await fetch(`${URL}/rest/v1/system_settings?key=eq.apasific_registered_users&select=value`, {
    headers: { ...HEADERS, 'Accept': 'application/json' }
  });
  const rows = await res.json();
  const sbUsers = rows?.[0]?.value 
    ? (Array.isArray(rows[0].value) ? rows[0].value : JSON.parse(rows[0].value))
    : [];

  console.log('=== REVIEWER PASSWORD CHECK ===\n');
  
  for (const email of TARGETS) {
    const local = localUsers.find(u => u.email?.toLowerCase() === email);
    const sb    = sbUsers.find(u => u.email?.toLowerCase() === email);
    
    const localPass = local?.password;
    const sbPass    = sb?.password;
    
    // Simulate merge: { ...local, ...sb }
    const merged = { ...(local || {}), ...(sb || {}) };
    const mergedPass = merged?.password;
    
    console.log(`📧 ${email}`);
    console.log(`   JSON password    : ${localPass ? `"${localPass}"` : '(MISSING)'}`);
    console.log(`   Supabase password: ${sbPass    ? `"${sbPass}"` : '(MISSING/NULL)'}`);
    console.log(`   After merge      : ${mergedPass ? `"${mergedPass}"` : '(MISSING — LOGIN AKAN GAGAL!)'}`);
    console.log('');
  }
}

check().catch(console.error);
