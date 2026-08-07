const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Pemetaan Jurnal yang Benar dan Akurat berdasarkan Database Backup & Bidang Keilmuan
const journalMapping = {
  '21633609': '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d', // AJCS - Pengabdian Kepada Masyarakat (PKM)
  '21580255': '08c59804-37e5-476f-9166-5d86f3dabc0d', // AJES - Ilmu Lingkungan & Keberlanjutan
  '21535734': '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d', // AJCS - Pengabdian Kepada Masyarakat (PKM)
  '21535711': '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d', // AJCS - Pengabdian Kepada Masyarakat (PKM)
  '21535685': '5f6bca5a-39e2-442b-a2e0-5b3f35614b4e', // AJAF - Akuntansi, Audit & Perpajakan
  '21535656': '5f6bca5a-39e2-442b-a2e0-5b3f35614b4e', // AJAF - Akuntansi, Audit & Perpajakan
  '21436978': '033cce77-8836-492c-8fff-a27a911b4701', // AJITE - Ilmu Komputer & Teknologi Informasi
  '21368192': '033cce77-8836-492c-8fff-a27a911b4701'  // AJITE - Ilmu Komputer & Teknologi Informasi
};

const targetZenodoIds = Object.keys(journalMapping);

// Helper REST API Supabase
async function supabaseRequest(urlPath, options = {}) {
  const url = `${supabaseUrl}/${urlPath}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Supabase REST Error [${urlPath}] HTTP ${response.status}: ${errText}`);
  }

  if (response.status === 204) return null;
  return await response.json();
}

async function runRecovery() {
  console.log('==================================================');
  console.log('      PROSES RESTORASI ARTIKEL DARI ZENODO        ');
  console.log('==================================================\n');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('ERROR: Supabase credentials not found in .env.local!');
    process.exit(1);
  }

  try {
    for (const zenodoId of targetZenodoIds) {
      console.log(`[*] Memproses Zenodo ID: ${zenodoId}...`);
      const doi = `10.5281/zenodo.${zenodoId}`;
      const journalId = journalMapping[zenodoId];

      // A. Fetch dari Zenodo API
      const zRes = await fetch(`https://zenodo.org/api/records/${zenodoId}`, {
        headers: { Accept: 'application/json' }
      });

      if (!zRes.ok) {
        console.warn(`   [!] Gagal mengambil data Zenodo untuk ID ${zenodoId} (HTTP ${zRes.status})`);
        continue;
      }

      const rec = await zRes.json();
      const title = rec.metadata?.title || rec.title || '';
      const abstract = rec.metadata?.description || '';
      const keywords = rec.metadata?.keywords || [];
      const authors = (rec.metadata?.creators || []).map(c => ({
        full_name: c.name || c.full_name || 'Unknown',
        orcid: c.orcid || '',
        affiliation: c.affiliation || ''
      }));
      const publishedDate = rec.metadata?.publication_date
        ? new Date(rec.metadata.publication_date).toISOString()
        : new Date().toISOString();

      // Cari file PDF di Zenodo
      const files = rec.files || [];
      const pdfFile = files.find(f => f.key?.endsWith('.pdf') || f.filename?.endsWith('.pdf'));
      const fileUrl = pdfFile ? (pdfFile.links?.self || pdfFile.links?.content || '') : '';

      // B. Cek apakah naskah sudah ada di database (by Zenodo ID atau DOI)
      const existingByZenodo = await supabaseRequest(`rest/v1/submissions?select=id,title,doi,zenodo_id&zenodo_id=eq.${zenodoId}`);
      const existingByDoi = await supabaseRequest(`rest/v1/submissions?select=id,title,doi,zenodo_id&doi=eq.${doi}`);
      
      const existing = (existingByZenodo && existingByZenodo.length > 0) ? existingByZenodo[0] 
                     : ((existingByDoi && existingByDoi.length > 0) ? existingByDoi[0] : null);

      const abstractForDb = JSON.stringify({
        abstract_en: abstract,
        authors,
        keywords: keywords.join(', '),
        doi
      });

      if (existing) {
        // C. Lakukan UPSERT - UPDATE metadata publik & Jurnal Asli
        console.log(`   -> Naskah ditemukan di database (ID: ${existing.id}). Melakukan UPDATE.`);
        const updates = {
          title,
          abstract: abstractForDb,
          status: 'Published',
          stage: 'Published',
          doi,
          zenodo_id: zenodoId,
          journal_id: journalId, // Update ke jurnal yang presisi
          created_at: publishedDate,
          updated_at: new Date().toISOString()
        };

        if (fileUrl) updates.file_url = fileUrl;

        await supabaseRequest(`rest/v1/submissions?id=eq.${existing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        console.log(`   [✓] Berhasil memperbarui metadata & jurnal.`);
      } else {
        // D. Lakukan UPSERT - INSERT baru dengan Jurnal Asli
        console.log(`   -> Naskah TIDAK ditemukan di database. Melakukan INSERT.`);
        const newId = crypto.randomUUID();
        const newRecord = {
          id: newId,
          title,
          abstract: abstractForDb,
          status: 'Published',
          stage: 'Published',
          doi,
          zenodo_id: zenodoId,
          journal_id: journalId, // Isi jurnal yang presisi
          created_at: publishedDate,
          updated_at: new Date().toISOString()
        };

        if (fileUrl) newRecord.file_url = fileUrl;

        await supabaseRequest(`rest/v1/submissions`, {
          method: 'POST',
          body: JSON.stringify(newRecord),
          headers: {
            'Prefer': 'return=representation'
          }
        });
        console.log(`   [✓] Berhasil menambahkan naskah baru (ID: ${newId}) ke Jurnal ID: ${journalId}.`);
      }
      console.log('--------------------------------------------------');
    }

    console.log('\n==================================================');
    console.log('         PROSES RESTORASI LENGKAP SELESAI         ');
    console.log('==================================================\n');

  } catch (err) {
    console.error('Terjadi kesalahan saat restorasi:', err.message);
  } finally {
    process.exit(0);
  }
}

runRecovery();
