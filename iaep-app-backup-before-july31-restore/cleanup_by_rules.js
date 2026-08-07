const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

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

// Target Zenodo IDs (Baik seri 215xxxx maupun 214xxxx)
const validZenodoIds = new Set([
  '21633609', '21580255', '21535734', '21535711', '21535685', '21535656',
  '21436978', '21368192', '21474443', '21483632', '21486466'
]);

// Helper Request REST API Supabase
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

// Helper Delete yang toleran terhadap tabel tidak ditemukan (404)
async function safeDelete(urlPath) {
  try {
    await supabaseRequest(urlPath, { method: 'DELETE' });
  } catch (err) {
    // Abaikan jika tabel tidak ditemukan (404 / PGRST205)
    if (err.message.includes('HTTP 404') || err.message.includes('PGRST205')) {
      // Abaikan secara aman
    } else {
      console.warn(`    [!] Peringatan saat hapus relasi: ${err.message}`);
    }
  }
}

async function checkFileExistsInStorage(filePath) {
  if (!filePath) return false;
  try {
    const parts = filePath.split('/');
    const fileName = parts.pop();
    const folderPath = parts.join('/');
    
    const listUrl = `storage/v1/object/list/manuscripts`;
    const response = await supabaseRequest(listUrl, {
      method: 'POST',
      body: JSON.stringify({
        prefix: folderPath,
        options: {
          search: fileName
        }
      })
    });

    return Array.isArray(response) && response.some(f => f.name === fileName);
  } catch (e) {
    return false;
  }
}

async function runCleanup() {
  console.log('==================================================');
  console.log('    PROSES PEMBERSIHAN DATABASE SESUAI ATURAN      ');
  console.log('==================================================\n');

  try {
    // 2. Inisialisasi Firebase Admin
    const keyPath = path.join(__dirname, 'firebase-admin-key.json');
    if (!fs.existsSync(keyPath)) {
      throw new Error('File firebase-admin-key.json tidak ditemukan!');
    }
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    const db = admin.firestore();
    console.log('[+] Firebase Admin berhasil diinisialisasi.');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase credentials tidak ditemukan di .env.local!');
    }

    // 3. Ambil semua submissions dari Supabase
    console.log('[+] Menghubungkan ke Supabase REST API...');
    const submissions = await supabaseRequest('rest/v1/submissions?select=*');
    console.log(`[+] Total naskah di Supabase saat ini: ${submissions.length}`);

    let deletedCount = 0;

    for (const sub of submissions) {
      const id = sub.id;
      const status = sub.status || '';
      const title = (sub.title || '').trim();
      
      const isPublished = ['Published', 'published', 'Production Completed'].includes(status);

      let shouldDelete = false;
      let deleteReason = '';

      if (isPublished) {
        // Aturan A: Cek apakah DOI / Zenodo ID cocok dengan daftar valid
        const zenId = sub.zenodo_id ? String(sub.zenodo_id).trim() : '';
        const doi = sub.doi ? String(sub.doi).trim() : '';
        const doiZenId = doi.split('.').pop() || '';

        const hasValidDoi = validZenodoIds.has(zenId) || validZenodoIds.has(doiZenId);
        
        if (!hasValidDoi) {
          shouldDelete = true;
          deleteReason = `Artikel Published/Production Completed tidak sesuai daftar DOI Zenodo resmi (Zenodo ID: ${zenId || 'NULL'}, DOI: ${doi || 'NULL'})`;
        }
      } else {
        // Aturan B: Untuk artikel di tahap review/copyedit, pastikan filenya eksis di storage
        const hasOriginalFile = await checkFileExistsInStorage(sub.original_file_url || sub.file_url);
        const hasAnonymousFile = await checkFileExistsInStorage(sub.anonymous_file_url);

        if (!hasOriginalFile && !hasAnonymousFile) {
          shouldDelete = true;
          deleteReason = `Naskah tahap ${sub.stage || 'NULL'} (${status}) tidak memiliki file fisik di Storage (Original: ${hasOriginalFile ? 'Ada' : 'Kosong'}, Anonim: ${hasAnonymousFile ? 'Ada' : 'Kosong'})`;
        }
      }

      // Eksekusi penghapusan jika tidak memenuhi syarat
      if (shouldDelete) {
        console.log(`\n[-] MENGHAPUS NASKAH ID: ${id}`);
        console.log(`    Judul     : "${title || 'Untitled'}"`);
        console.log(`    Status    : ${status}`);
        console.log(`    Alasan    : \x1b[31m${deleteReason}\x1b[0m`);

        // A. Hapus data relasi di Supabase (secara aman, jika tabel ada)
        await safeDelete(`rest/v1/review_assignments?submission_id=eq.${id}`);
        await safeDelete(`rest/v1/submission_history?submission_id=eq.${id}`);
        await safeDelete(`rest/v1/certificates?reference_id=eq.${id}`);
        await safeDelete(`rest/v1/submission_files?submission_id=eq.${id}`);

        // B. Hapus dari tabel submissions Supabase
        await supabaseRequest(`rest/v1/submissions?id=eq.${id}`, { method: 'DELETE' });
        console.log(`    [✓] Berhasil hapus di Supabase.`);

        // C. Hapus dari Firestore
        try {
          await db.collection('submissions').doc(id).delete();
          console.log(`    [✓] Berhasil hapus di Firestore.`);
        } catch (fsErr) {
          console.warn(`    [!] Gagal hapus di Firestore: ${fsErr.message}`);
        }

        deletedCount++;
      }
    }

    console.log('\n==================================================');
    console.log(`  PEMBERSIHAN SELESAI. TOTAL DIHAPUS: ${deletedCount} NASKAH   `);
    console.log('==================================================\n');

  } catch (error) {
    console.error('Terjadi kesalahan saat proses pembersihan:', error.message);
  } finally {
    process.exit(0);
  }
}

runCleanup();
