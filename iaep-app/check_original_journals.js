const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\BI News\\.gemini\\antigravity-ide\\brain\\80e2537b-5cca-4a9f-82cf-137796fe194a';
const backupPath = path.join(brainDir, 'supabase_backup.json');

if (!fs.existsSync(backupPath)) {
  console.log('Error: supabase_backup.json tidak ditemukan!');
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

console.log('\n==================================================');
    console.log('       JURNAL ASLI DARI SUPABASE BACKUP            ');
    console.log('==================================================\n');

const targets = [
  { zenId: '21633609', title: 'ANALYSIS OF THE EFFECTIVENESS OF STRATEGIC' },
  { zenId: '21580255', title: 'CARBON SEQUESTRATION' },
  { zenId: '21535734', title: 'Empowering Muslim MSMEs' },
  { zenId: '21535711', title: 'THE IMPACT OF SUPPLY CHAIN' },
  { zenId: '21535685', title: 'Factors Affecting Regulatory Non-Compliance' },
  { zenId: '21535656', title: 'Zakat and Tax Accounting' },
  { zenId: '21436978', title: 'Implementation of the Integrated' },
  { zenId: '21368192', title: 'Integrated Academic Ecosystem' }
];

targets.forEach(t => {
  const found = backup.find(s => 
    (s.zenodo_id && String(s.zenodo_id) === t.zenId) || 
    (s.title && s.title.toLowerCase().includes(t.title.toLowerCase()))
  );

  if (found) {
    console.log(`Zenodo ID: ${t.zenId}`);
    console.log(`  Judul  : "${found.title}"`);
    console.log(`  Jurnal : ${found.journal_id}`);
    console.log(`  Status : ${found.status}`);
  } else {
    console.log(`Zenodo ID: ${t.zenId} - Tidak ditemukan di backup`);
  }
  console.log('--------------------------------------------------');
});
