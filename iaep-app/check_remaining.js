const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let serviceRoleKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const tLine = line.trim();
    if (tLine.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = tLine.split('=')[1].trim();
    }
    if (tLine.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      serviceRoleKey = tLine.split('=')[1].trim();
    }
  });
}

async function checkRemaining() {
  try {
    const queryParams = new URLSearchParams({
      select: 'id,title,status,stage,doi,zenodo_id,created_at'
    });
    const url = `${supabaseUrl}/rest/v1/submissions?${queryParams.toString()}`;
    const response = await fetch(url, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('\n==================================================');
    console.log('       NASKAH YANG TERSISA DI DATABASE             ');
    console.log('==================================================\n');
    console.log(`Total naskah tersisa: ${data.length}\n`);

    data.forEach((sub, idx) => {
      console.log(`[${idx + 1}] ID: ${sub.id}`);
      console.log(`    Judul     : "${sub.title}"`);
      console.log(`    Status    : ${sub.status}`);
      console.log(`    Stage     : ${sub.stage}`);
      console.log(`    DOI       : ${sub.doi || 'NULL'}`);
      console.log(`    Zenodo ID : ${sub.zenodo_id || 'NULL'}`);
      console.log('--------------------------------------------------');
    });

  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

checkRemaining();
