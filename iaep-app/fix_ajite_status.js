const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

// 1. Inisialisasi Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aroasmlrlpjbjokvxlgo.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Inisialisasi Firebase
let db;
try {
  // Check if already initialized to prevent error
  if (!admin.apps.length) {
    const serviceAccount = require('./service-account.json'); // Asumsikan file ini ada atau kita gunakan path yg benar
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  db = admin.firestore();
} catch (e) {
  console.log("Using default firebase admin (already authenticated in environment)");
  if (!admin.apps.length) {
      admin.initializeApp();
  }
  db = admin.firestore();
}

async function fixArticle() {
  const articleId = 'sub_1784062294881_r2jx1m4'; // ID Artikel AJITE yang bermasalah

  console.log(`Fixing article: ${articleId}`);

  // Update in Firestore
  try {
    await db.collection('submissions').doc(articleId).update({
      status: 'Published',
      stage: 'Published',
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Firestore updated successfully');
  } catch (err) {
    console.error('❌ Error updating Firestore:', err.message);
  }

  // Update in Supabase
  try {
    const { data, error } = await supabase
      .from('submissions')
      .update({ status: 'Published', stage: 'Published' })
      .eq('id', articleId);
      
    if (error) {
       console.error('❌ Error updating Supabase:', error);
    } else {
       console.log('✅ Supabase updated successfully');
    }
  } catch (err) {
    console.error('❌ Error updating Supabase:', err.message);
  }
}

fixArticle();
