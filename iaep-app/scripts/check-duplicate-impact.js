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

async function checkRelations() {
  const targetId = 'fe40ad1b-7d09-462f-a0e8-7cae785fd2cf';
  console.log(`=== AUDIT RELASI DAN DAMPAK UNTUK ID BARU: ${targetId} ===\n`);

  const tablesToCheck = [
    { name: 'certificates', col: 'reference_id' },
    { name: 'review_assignments', col: 'submission_id' },
    { name: 'submission_activity_log', col: 'submission_id' },
    { name: 'article_authors', col: 'submission_id' },
    { name: 'reviews', col: 'submission_id' },
  ];

  const results = {};

  for (const t of tablesToCheck) {
    try {
      const res = await fetch(
        `${URL}/rest/v1/${t.name}?${t.col}=eq.${targetId}&select=*`,
        { headers: HEADERS }
      );
      const data = await res.json();
      results[t.name] = Array.isArray(data) ? data : [];
    } catch (e) {
      results[t.name] = `Error: ${e.message}`;
    }
  }

  console.log('HASIL AUDIT RELASI TABEL:');
  console.log(JSON.stringify(results, null, 2));
}

checkRelations().catch(console.error);
