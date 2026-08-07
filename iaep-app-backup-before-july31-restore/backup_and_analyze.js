const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');

// 1. Load Environment Variables from .env.local
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

function getMd5Checksum(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

// Gunakan native fetch untuk REST API Supabase
async function supabaseRequest(endpoint, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`;
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
    throw new Error(`Supabase REST Error HTTP ${response.status}: ${errText}`);
  }

  // Handle DELETE/HEAD requests that return empty content
  if (response.status === 204) return null;
  return await response.json();
}

async function runBackupAndAnalysis() {
  console.log('==================================================');
  console.log('      PROSES BACKUP & ANALISIS RELASI DATA        ');
  console.log('==================================================\n');

  try {
    const brainDir = 'C:\\Users\\BI News\\.gemini\\antigravity-ide\\brain\\80e2537b-5cca-4a9f-82cf-137796fe194a';
    if (!fs.existsSync(brainDir)) {
      fs.mkdirSync(brainDir, { recursive: true });
    }

    // 2. Initialize Firebase Admin
    const keyPath = path.join(__dirname, 'firebase-admin-key.json');
    if (!fs.existsSync(keyPath)) {
      throw new Error('File firebase-admin-key.json tidak ditemukan!');
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('[+] Firebase Admin berhasil diinisialisasi.');
    
    const db = admin.firestore();

    // ==========================================
    // FASE 1A: BACKUP DATA
    // ==========================================
    console.log('\n[Fase 1A] Memulai pencadangan database...');

    // A. Backup Firestore Submissions
    console.log('   -> Membaca submissions dari Firestore...');
    const fsSnap = await db.collection('submissions').get();
    const fsSubmissions = [];
    fsSnap.forEach(doc => {
      fsSubmissions.push({ id: doc.id, ...doc.data() });
    });
    
    const fsBackupPath = path.join(brainDir, 'firestore_backup.json');
    const fsBackupStr = JSON.stringify(fsSubmissions, null, 2);
    fs.writeFileSync(fsBackupPath, fsBackupStr, 'utf8');
    const fsChecksum = getMd5Checksum(fsBackupStr);
    console.log(`   -> Firestore Backup: ${fsSubmissions.length} dokumen cadangan berhasil ditulis.`);

    // B. Backup Supabase Submissions
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase credentials tidak ditemukan di .env.local!');
    }
    console.log('   -> Membaca submissions dari Supabase...');
    const sbSubmissions = await supabaseRequest('submissions?select=*');
    
    const sbBackupPath = path.join(brainDir, 'supabase_backup.json');
    const sbBackupStr = JSON.stringify(sbSubmissions, null, 2);
    fs.writeFileSync(sbBackupPath, sbBackupStr, 'utf8');
    const sbChecksum = getMd5Checksum(sbBackupStr);
    console.log(`   -> Supabase Backup: ${sbSubmissions.length} baris cadangan berhasil ditulis.`);

    // C. Tulis Manifest Backup
    const manifestPath = path.join(brainDir, 'backup_manifest.json');
    const manifest = {
      timestamp: new Date().toISOString(),
      firestore: {
        records: fsSubmissions.length,
        checksum: fsChecksum,
        path: fsBackupPath
      },
      supabase: {
        records: sbSubmissions.length,
        checksum: sbChecksum,
        path: sbBackupPath
      }
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('[+] Manifest cadangan berhasil diperbarui.');

    // ==========================================
    // FASE 1B: ANALISIS KANDIDAT PEMBERSIHAN
    // ==========================================
    console.log('\n[Fase 1B] Memulai analisis relasi naskah kosong...');
    const candidates = [];

    for (const doc of fsSubmissions) {
      const title = (doc.title || '').trim();
      const status = doc.status || 'unknown';

      // Kriteria naskah dummy/kosong
      if (!title || title.toLowerCase() === 'untitled') {
        const id = doc.id;

        // 1. Hitung Reviewer Assignments di Supabase
        const sbReviews = await supabaseRequest(`review_assignments?select=id&submission_id=eq.${id}`);
        const sbReviewCount = sbReviews ? sbReviews.length : 0;

        // 2. Hitung Submission History di Supabase
        const sbHistory = await supabaseRequest(`submission_history?select=id&submission_id=eq.${id}`);
        const sbHistoryCount = sbHistory ? sbHistory.length : 0;

        // 3. Hitung Certificates di Supabase
        const sbCerts = await supabaseRequest(`certificates?select=id&reference_id=eq.${id}`);
        const sbCertCount = sbCerts ? sbCerts.length : 0;

        // 4. Cek Supabase existence
        const existsInSupa = sbSubmissions.some(s => s.id === id);

        const totalRelations = sbReviewCount + sbHistoryCount + sbCertCount;
        const recommendation = totalRelations === 0 ? 'DELETE CANDIDATE' : 'KEEP (Memiliki Relasi Aktif)';

        candidates.push({
          submissionId: id,
          status,
          reviewerCount: sbReviewCount,
          historyCount: sbHistoryCount,
          certificateCount: sbCertCount,
          existsInSupa,
          recommendation
        });
      }
    }

    // Tulis Laporan Kandidat
    const reportPath = path.join(brainDir, 'candidate_report.md');
    let reportMd = `# Laporan Kandidat Pembersihan Data Dummy (Enriched Candidate Report)

Laporan ini mencantumkan seluruh naskah ber-judul kosong/"Untitled" di Firestore beserta analisis relasi aktifnya di database Supabase.

> [warning]
> **Petunjuk Tindakan:**
> *   **DELETE CANDIDATE:** Naskah dummy murni tanpa relasi apa pun. Aman untuk dihapus.
> *   **KEEP:** Naskah memiliki catatan review, riwayat, atau sertifikat aktif. **TIDAK BOLEH** dihapus. Statusnya harus di-lock dan metadatanya dipulihkan dari Zenodo pada Fase 4.

## Daftar Kandidat Penyelidikan

| No | ID Naskah | Status Firestore | Review Count | History Count | Cert Count | Ada di Supabase? | Rekomendasi Tindakan |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
`;

    candidates.forEach((c, idx) => {
      const isSupa = c.existsInSupa ? 'Ya' : 'Tidak';
      const recLabel = c.recommendation === 'DELETE CANDIDATE' 
        ? `🔴 **${c.recommendation}**` 
        : `🟢 **${c.recommendation}**`;

      reportMd += `| ${idx + 1} | \`${c.submissionId}\` | ${c.status} | ${c.reviewerCount} | ${c.historyCount} | ${c.certificateCount} | ${isSupa} | ${recLabel} |\n`;
    });

    reportMd += `\n\n---\n*Laporan dibuat otomatis pada: ${new Date().toISOString()}*`;
    
    fs.writeFileSync(reportPath, reportMd, 'utf8');
    console.log(`[+] Laporan kandidat berhasil ditulis ke: ${reportPath}`);
    console.log('\n==================================================');
    console.log('       PROSES BACKUP & ANALISIS SELESAI           ');
    console.log('==================================================\n');

  } catch (error) {
    console.error('\nGagal menjalankan proses:', error.message);
  } finally {
    process.exit(0);
  }
}

runBackupAndAnalysis();
