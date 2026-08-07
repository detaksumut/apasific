const fs = require('fs');
try {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  });
} catch(e) {}
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// 1. Init Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Init Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (serviceAccountBase64) {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      admin.initializeApp();
    }
  } catch (e) {
    console.error("Firebase init error:", e.message);
  }
}
const db = admin.firestore ? admin.firestore() : null;

async function searchNgatimin() {
  console.log("=== PENCARIAN 'Ngatimin' ===");
  const keyword = "Ngatimin";

  // --- SUPABASE SEARCH ---
  console.log("\n[1] Mencari di Supabase...");
  try {
    // Check profiles
    const { data: pData } = await supabase.from('profiles').select('*').ilike('full_name', `%${keyword}%`);
    if (pData && pData.length > 0) console.log("=> Ditemukan di tabel 'profiles':", pData);
    else console.log("=> Tidak ada di 'profiles'");

    // Check membership
    const { data: mData } = await supabase.from('membership_applications').select('*').ilike('full_name', `%${keyword}%`);
    if (mData && mData.length > 0) console.log("=> Ditemukan di tabel 'membership_applications':", mData);
    else console.log("=> Tidak ada di 'membership_applications'");

    // Check submissions authors
    const { data: sData } = await supabase.from('submissions').select('id, title, abstract, created_at, submitter_name, submitter_email').or(`submitter_name.ilike.%${keyword}%,abstract.ilike.%${keyword}%`);
    if (sData && sData.length > 0) console.log("=> Ditemukan di tabel 'submissions':", sData);
    else console.log("=> Tidak ada di 'submissions'");
  } catch(e) {
    console.log("Error Supabase:", e.message);
  }

  // --- FIRESTORE SEARCH ---
  if (db) {
    console.log("\n[2] Mencari di Firestore...");
    try {
      // Because Firestore doesn't support ILIKE natively across all fields easily, we'll fetch and filter in memory
      // Check users
      const usersSnap = await db.collection('users').get();
      const users = [];
      usersSnap.forEach(doc => {
        const d = doc.data();
        if (JSON.stringify(d).toLowerCase().includes(keyword.toLowerCase())) users.push({id: doc.id, ...d});
      });
      if (users.length > 0) console.log("=> Ditemukan di collection 'users':", users);
      else console.log("=> Tidak ada di 'users'");

      // Check membership_applications
      const memSnap = await db.collection('membership_applications').get();
      const mems = [];
      memSnap.forEach(doc => {
        const d = doc.data();
        if (JSON.stringify(d).toLowerCase().includes(keyword.toLowerCase())) mems.push({id: doc.id, ...d});
      });
      if (mems.length > 0) console.log("=> Ditemukan di collection 'membership_applications':", mems);
      else console.log("=> Tidak ada di 'membership_applications'");

      // Check submissions
      const subSnap = await db.collection('submissions').get();
      const subs = [];
      subSnap.forEach(doc => {
        const d = doc.data();
        if (JSON.stringify(d).toLowerCase().includes(keyword.toLowerCase())) subs.push({id: doc.id, ...d});
      });
      if (subs.length > 0) {
        console.log(`=> Ditemukan ${subs.length} naskah di collection 'submissions':`);
        subs.forEach(s => console.log(`   - ID: ${s.id}, Judul: ${s.title?.substring(0, 50)}..., Submitter: ${s.submitter_name || s.author_name}`));
      } else console.log("=> Tidak ada di 'submissions'");
    } catch(e) {
      console.log("Error Firestore:", e.message);
    }
  } else {
    console.log("\n[2] Firestore tidak tersedia/belum terhubung.");
  }
}

searchNgatimin();
