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

async function checkJournals() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/journals?select=*`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    });
    const journals = await response.json();
    console.log('\n==================================================');
    console.log('            DAFTAR JURNAL DI SUPABASE              ');
    console.log('==================================================\n');
    journals.forEach(j => {
      console.log(`ID: ${j.id}`);
      console.log(`Name: ${j.name}`);
      console.log(`Code/Acronym: ${j.acronym || 'NULL'}`);
      console.log('--------------------------------------------------');
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}

checkJournals();
