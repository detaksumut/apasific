const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

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

console.log('--- DIAGNOSTIK KONEKSI ---');
console.log('Supabase URL:', supabaseUrl ? 'Ditemukan' : 'TIDAK Ditemukan');
console.log('Supabase Key:', serviceRoleKey ? 'Ditemukan' : 'TIDAK Ditemukan');

async function runCleanup() {
  try {
    // 2. Initialize Firebase Admin
    const keyPath = path.join(__dirname, 'firebase-admin-key.json');
    if (!fs.existsSync(keyPath)) {
      throw new Error('File firebase-admin-key.json tidak ditemukan di folder root iaep-app!');
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin berhasil diinisialisasi.');
    
    const db = admin.firestore();

    // 3. Clean up Firestore
    console.log('\n--- MEMBERSIHKAN FIRESTORE ---');
    const fsSnap = await db.collection('submissions').get();
    let fsDeletedCount = 0;
    
    for (const doc of fsSnap.docs) {
      const data = doc.data();
      const title = (data.title || '').trim();
      
      // Kriteria dummy: Judul kosong, undefined, atau 'Untitled'
      if (!title || title.toLowerCase() === 'untitled') {
        console.log(`Menghapus dummy Firestore ID: ${doc.id} | Judul: "${title || 'NULL'}" | Status: ${data.status}`);
        await doc.ref.delete();
        fsDeletedCount++;
      }
    }
    console.log(`Total data dummy dihapus di Firestore: ${fsDeletedCount}`);

    // 4. Clean up Supabase
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase URL atau Service Role Key tidak ditemukan di .env.local!');
    }

    console.log('\n--- MEMBERSIHKAN SUPABASE ---');
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Ambil data yang berpotensi dihapus untuk log
    const { data: supaCheck } = await supabase
      .from('submissions')
      .select('id, title, status')
      .or('title.ilike.untitled,title.is.null,title.eq.');

    if (supaCheck && supaCheck.length > 0) {
      supaCheck.forEach(row => {
        console.log(`Menghapus dummy Supabase ID: ${row.id} | Judul: "${row.title || 'NULL'}" | Status: ${row.status}`);
      });
    }

    // Eksekusi penghapusan
    const { data: deletedSupa, error: supaError } = await supabase
      .from('submissions')
      .delete()
      .or('title.ilike.untitled,title.is.null,title.eq.')
      .select('id, title');

    if (supaError) throw supaError;
    
    const supaDeletedCount = deletedSupa ? deletedSupa.length : 0;
    console.log(`Total data dummy dihapus di Supabase: ${supaDeletedCount}`);

    console.log('\n--- PEMBERSIHAN SELESAI ---');

  } catch (error) {
    console.error('Terjadi kesalahan saat pembersihan:', error.message);
  } finally {
    process.exit(0);
  }
}

runCleanup();
