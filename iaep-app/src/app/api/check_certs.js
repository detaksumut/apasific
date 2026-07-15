const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kcvobgchghvdfuonhswj.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Firebase Admin setup
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {
    admin.initializeApp({
      projectId: "iaep-app"
    });
  }
}
const db = admin.firestore();

async function run() {
  console.log("--- Supabase Profiles for Marahman ---");
  const { data: prof } = await supabase.from('profiles').select('*').eq('email', 'kadsumut@gmail.com');
  console.log("Profiles:", prof);

  if (prof && prof.length > 0) {
    const userId = prof[0].id;
    console.log("User ID:", userId);

    console.log("--- Supabase Certificates ---");
    const { data: certs } = await supabase.from('certificates').select('*');
    console.log("All Certificates in Supabase:", certs);

    console.log("--- Supabase Submissions for Marahman ---");
    const { data: subs } = await supabase.from('submissions').select('*').eq('author_id', userId);
    console.log("Submissions in Supabase:", subs);

    console.log("--- Firestore Submissions for Marahman ---");
    const fbSubs = await db.collection('submissions').where('author_id', '==', userId).get();
    fbSubs.forEach(d => console.log("Sub:", d.id, d.data()));

    console.log("--- Firestore Certificates ---");
    const fbCerts = await db.collection('certificates').get();
    fbCerts.forEach(d => console.log("Cert:", d.id, d.data()));
  }
}

run().catch(console.error);
