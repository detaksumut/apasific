const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', // Dummy if not in env
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function check() {
  const hexId = '7375625f-3137-3834-3436-353736303538';
  const originalId = 'sub_17-84-46-576058';

  console.log("Checking Supabase for hexId...");
  const { data: supaHex, error: e1 } = await supabase.from('submissions').select('*').eq('id', hexId).single();
  console.log("Supabase Hex:", supaHex ? (supaHex.file_url ? 'HAS file_url: ' + supaHex.file_url : 'NO file_url') : (e1 ? e1.message : 'NOT FOUND'));

  console.log("\nChecking Supabase for originalId...");
  const { data: supaOrig, error: e2 } = await supabase.from('submissions').select('*').eq('id', originalId).single();
  console.log("Supabase Orig:", supaOrig ? (supaOrig.file_url ? 'HAS file_url: ' + supaOrig.file_url : 'NO file_url') : (e2 ? e2.message : 'NOT FOUND'));

  console.log("\nChecking Firestore for hexId...");
  const fsHex = await db.collection('submissions').doc(hexId).get();
  console.log("Firestore Hex:", fsHex.exists ? (fsHex.data().file_url ? 'HAS file_url: ' + fsHex.data().file_url : 'NO file_url') : 'NOT FOUND');

  console.log("\nChecking Firestore for originalId...");
  const fsOrig = await db.collection('submissions').doc(originalId).get();
  console.log("Firestore Orig:", fsOrig.exists ? (fsOrig.data().file_url ? 'HAS file_url: ' + fsOrig.data().file_url : 'NO file_url') : 'NOT FOUND');
}

// Just load env first
require('dotenv').config({ path: '.env.local' });
const s2 = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
async function runReal() {
    const hexId = '7375625f-3137-3834-3436-353736303538';
    const originalId = 'sub_17-84-46-576058';
    
    console.log("REAL Check Supabase Hex...");
    const { data: d1 } = await s2.from('submissions').select('id, title, file_url, revised_file_url').eq('id', hexId).single();
    console.log(d1 || 'Not found');
    
    console.log("REAL Check Supabase Orig...");
    const { data: d2 } = await s2.from('submissions').select('id, title, file_url, revised_file_url').eq('id', originalId).single();
    console.log(d2 || 'Not found');
    
    console.log("REAL Check Firestore Hex...");
    const f1 = await db.collection('submissions').doc(hexId).get();
    if(f1.exists) console.log({ id: f1.id, title: f1.data().title, file_url: f1.data().file_url }); else console.log('Not found');

    console.log("REAL Check Firestore Orig...");
    const f2 = await db.collection('submissions').doc(originalId).get();
    if(f2.exists) console.log({ id: f2.id, title: f2.data().title, file_url: f2.data().file_url }); else console.log('Not found');
    
    process.exit(0);
}
runReal();
