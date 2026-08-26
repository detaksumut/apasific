const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...rest] = line.split('=');
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const HEADERS = { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };

async function main() {
  console.log('=== INSPEKSI READ-ONLY DATA 14 ARTIKEL PUBLISHED SUPABASE ===\n');
  
  const res = await fetch(
    `${URL}/rest/v1/submissions?status=eq.Published&select=id,title,author,created_at,updated_at,journals(name)&order=created_at.desc`,
    { headers: HEADERS }
  );
  
  const data = await res.json();
  
  if (!Array.isArray(data)) {
    console.error('Fetch error:', data);
    return;
  }
  
  console.log(`Total Published Submissions ditemukan: ${data.length}\n`);
  
  data.forEach((sub, idx) => {
    console.log(`[${idx + 1}] ID: ${sub.id}`);
    console.log(`    Judul     : ${sub.title}`);
    console.log(`    Penulis   : ${sub.author || '-'}`);
    console.log(`    Jurnal    : ${sub.journals?.name || '-'}`);
    console.log(`    created_at (Date Submit): ${sub.created_at}`);
    console.log(`    updated_at              : ${sub.updated_at}`);
    console.log('--------------------------------------------------');
  });
}

main().catch(console.error);
