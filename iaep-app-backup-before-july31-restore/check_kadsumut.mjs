import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const outFile = 'output_kadsumut.txt';
fs.writeFileSync(outFile, ''); // clear file
function log(msg) { fs.appendFileSync(outFile, msg + '\n'); }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkReviews() {
  log("Mengecek Supabase untuk reviewer: kadsumut@gmail.com");
  const { data, error } = await supabase
    .from('review_assignments')
    .select('*')
    .ilike('reviewer_email', '%kadsumut@gmail.com%');
    
  if (error) {
    log("Error fetching from Supabase: " + error.message);
  } else {
    log(`Ditemukan ${data.length} review assignments di Supabase:`);
    data.forEach((r, idx) => {
      log(`\n--- Review ${idx + 1} ---`);
      log(`ID Assignment: ${r.id}`);
      log(`Submission ID: ${r.submission_id}`);
      log(`Status: ${r.status}`);
      log(`Recommendation: ${r.recommendation}`);
      log(`Updated At: ${r.updated_at}`);
      log(`Comments for Editor: ${r.comments_for_editor ? 'Ada' : 'Kosong'}`);
    });
  }

  log("\n===================================\n");
  log("Mengecek Firestore (Firebase)...");
  
  try {
    const admin = await import('firebase-admin');
    
    // Check if default app is initialized
    if (!admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
      });
    }

    const db = admin.default.firestore();
    const snap = await db.collection('review_assignments')
      .where('reviewer_email', '==', 'kadsumut@gmail.com')
      .get();
      
    if (snap.empty) {
      log("Tidak ada data ditemukan di Firestore.");
    } else {
      log(`Ditemukan ${snap.size} review assignments di Firestore:`);
      snap.forEach((doc) => {
        const d = doc.data();
        log(`\n--- Review (Firestore) ---`);
        log(`ID Assignment: ${doc.id}`);
        log(`Submission ID: ${d.submission_id}`);
        log(`Status: ${d.status}`);
        log(`Recommendation: ${d.recommendation || d.decision}`);
        log(`Updated At: ${d.updated_at?.toDate ? d.updated_at.toDate() : d.updated_at}`);
      });
    }
  } catch (err) {
    log("Gagal mengecek Firestore: " + err.message);
  }
}

checkReviews();
