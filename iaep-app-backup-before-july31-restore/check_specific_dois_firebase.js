const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// 1. Target DOIs
const targetDois = [
  '10.5281/zenodo.21535734',
  '10.5281/zenodo.21535711',
  '10.5281/zenodo.21535685',
  '10.5281/zenodo.21535656'
];
const targetZenodoIds = targetDois.map(doi => doi.split('.').pop());

async function checkFirebase() {
  try {
    // 2. Initialize Firebase Admin
    const keyPath = path.join(__dirname, 'firebase-admin-key.json');
    if (!fs.existsSync(keyPath)) {
      throw new Error('File firebase-admin-key.json tidak ditemukan!');
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();
    
    // 3. Ambil semua submissions dari Firestore (karena hanya 22 dokumen, scan in-memory sangat efisien dan akurat)
    const snap = await db.collection('submissions').get();
    const data = [];
    snap.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });

    console.log('\n==================================================');
    console.log('         LAPORAN DIAGNOSTIK DOI FIREBASE          ');
    console.log('==================================================\n');

    targetDois.forEach((doi, idx) => {
      const zenId = targetZenodoIds[idx];
      
      // Cari apakah ada di data Firestore
      const found = data.find(s => 
        (s.doi && s.doi.trim() === doi) || 
        (s.zenodo_id && String(s.zenodo_id).trim() === zenId)
      );

      console.log(`[${idx + 1}] DOI: ${doi}`);
      console.log(`    Zenodo ID : ${zenId}`);
      if (found) {
        console.log(`    STATUS    : \x1b[32mDITEMUKAN DI FIREBASE\x1b[0m`);
        console.log(`    ID        : ${found.id}`);
        console.log(`    Judul     : "${found.title || 'Untitled'}"`);
        console.log(`    Status Db : ${found.status}`);
        console.log(`    Stage Db  : ${found.stage || 'NULL'}`);
        console.log(`    Created   : ${found.created_at ? (found.created_at.toDate ? found.created_at.toDate().toISOString() : found.created_at) : 'NULL'}`);
      } else {
        console.log(`    STATUS    : \x1b[31mTIDAK DITEMUKAN DI FIREBASE (KOSONG)\x1b[0m`);
      }
      console.log('--------------------------------------------------');
    });

  } catch (error) {
    console.error('Gagal melakukan query ke Firebase:', error.message);
  } finally {
    process.exit(0);
  }
}

checkFirebase();
