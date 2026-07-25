import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let output = "";
  function log(msg: string) { output += msg + "\n"; }

  log("Mengecek submissions dengan status terkait revisi...");
  const { data: subs, error: errSubs } = await supabase
    .from('submissions')
    .select('id, title, status')
    .ilike('status', '%revis%');

  if (errSubs) log("Error submissions: " + errSubs.message);
  else {
    log(`Ditemukan ${subs.length} submissions dengan status revisi:`);
    subs.forEach(s => log(`- ${s.id} | ${s.status} | ${s.title}`));
  }

  const { data: subs2 } = await supabase
    .from('submissions')
    .select('id, title, status')
    .ilike('status', '%review%');
  if (subs2) {
    log(`\nDitemukan ${subs2.length} submissions under review:`);
    subs2.slice(0, 5).forEach(s => log(`- ${s.id} | ${s.status}`));
  }

  log("\n===================================\n");
  log("Mengecek Supabase untuk SEMUA reviewer yang mengirim Revisi Mayor/Minor (Kueri Baru)...");
  const { data, error } = await supabase
    .from('review_assignments')
    .select('*')
    .in('recommendation', ['major_revision', 'revisions_major', 'minor_revision', 'revisions_minor', 'Major Revisions Required', 'Minor Revisions Required']);
    
  if (error) {
    log("Error fetching from Supabase: " + error.message);
  } else if (data) {
    log(`Ditemukan ${data.length} review assignments (Revisi) di Supabase:`);
    data.forEach((r, idx) => {
      log(`\n--- Review ${idx + 1} ---`);
      log(`Reviewer: ${r.reviewer_email}`);
      log(`Submission ID: ${r.submission_id}`);
      log(`Status: ${r.status}`);
      log(`Recommendation: ${r.recommendation}`);
      log(`Updated At: ${r.updated_at}`);
    });
  }

  // Cek Firestore
  try {
    const admin = await import('firebase-admin');
    if (!admin.default.apps.length) {
      admin.default.initializeApp({
        credential: admin.default.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!))
      });
    }
    const db = admin.default.firestore();
    const snap = await db.collection('review_assignments').get();
    let count = 0;
    snap.forEach((doc) => {
      const d = doc.data();
      const rec = d.recommendation || d.decision;
      if (rec && typeof rec === 'string' && rec.toLowerCase().includes('revis')) {
        count++;
        log(`\n--- Review (Firestore) ---`);
        log(`Reviewer: ${d.reviewer_email}`);
        log(`Submission ID: ${d.submission_id}`);
        log(`Recommendation: ${rec}`);
      }
    });
    log(`\nTotal ${count} revisi di Firestore.`);
  } catch (e: any) {
    log("Error firestore: " + e.message);
  }

  return new NextResponse(output, { headers: { 'Content-Type': 'text/plain' } });
}
