const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables
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

const targetDois = [
  '10.5281/zenodo.21633609',
  '10.5281/zenodo.21580255',
  '10.5281/zenodo.21535734',
  '10.5281/zenodo.21535711',
  '10.5281/zenodo.21535685',
  '10.5281/zenodo.21535656'
];

async function checkDois() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERROR: Supabase credentials not found in .env.local!');
    process.exit(1);
  }

  const targetZenodoIds = targetDois.map(doi => doi.split('.').pop());

  try {
    // Gunakan native fetch REST API Supabase agar terhindar dari error WebSocket di Node.js < 22
    const queryParams = new URLSearchParams({
      select: 'id,title,status,stage,doi,zenodo_id,created_at',
      or: `(doi.in.(${targetDois.map(d => `"${d}"`).join(',')}),zenodo_id.in.(${targetZenodoIds.map(z => `"${z}"`).join(',')}))`
    });

    const url = `${supabaseUrl}/rest/v1/submissions?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();

    console.log('\n==================================================');
    console.log('         LAPORAN DIAGNOSTIK DOI SUPABASE          ');
    console.log('==================================================\n');

    targetDois.forEach((doi, idx) => {
      const zenId = targetZenodoIds[idx];
      const found = (data || []).find(s => 
        (s.doi && s.doi.trim() === doi) || 
        (s.zenodo_id && String(s.zenodo_id).trim() === zenId)
      );

      console.log(`[${idx + 1}] DOI: ${doi}`);
      console.log(`    Zenodo ID : ${zenId}`);
      if (found) {
        console.log(`    STATUS    : \x1b[32mDITEMUKAN\x1b[0m`);
        console.log(`    ID        : ${found.id}`);
        console.log(`    Judul     : "${found.title}"`);
        console.log(`    Status Db : ${found.status}`);
        console.log(`    Stage Db  : ${found.stage || 'NULL'}`);
        console.log(`    Created   : ${found.created_at}`);
      } else {
        console.log(`    STATUS    : \x1b[31mTIDAK DITEMUKAN (KOSONG)\x1b[0m`);
      }
      console.log('--------------------------------------------------');
    });

  } catch (err) {
    console.error('Gagal melakukan query ke Supabase:', err.message);
  } finally {
    process.exit(0);
  }
}

checkDois();
