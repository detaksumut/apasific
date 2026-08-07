const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n');
for (let line of envConfig) {
  if (line.includes('=')) {
    const [key, val] = line.split('=');
    process.env[key.trim()] = val.trim();
  }
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function check() {
  try {
    const res = await fetch(`${url}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    const data = await res.json();
    if (!Array.isArray(data)) {
      console.log("REST Error:", data);
      return;
    }
    
    const coAdmins = data.filter(u => u.role === 'co_admin' || u.role === 'co-admin');
    console.log(`TOTAL CO-ADMINS IN DB: ${coAdmins.length}`);
    if (coAdmins.length > 0) {
      console.log("Co-Admins:");
      coAdmins.forEach(r => console.log(`- ${r.full_name} (${r.email}) | ID: ${r.id} | Role: ${r.role}`));
    }
  } catch (e) {
    console.error("Error fetching data:", e);
  }
}
check();
