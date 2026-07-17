import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const keyword = "Ngatimin";
  let results: any = { supabase: {}, firestore: {} };

  try {
    // SUPABASE
    const { data: pData } = await supabaseAdmin.from('profiles').select('*').ilike('full_name', `%${keyword}%`);
    results.supabase.profiles = pData;

    const { data: mData } = await supabaseAdmin.from('membership_applications').select('*').ilike('full_name', `%${keyword}%`);
    results.supabase.membership_applications = mData;

    const { data: sData } = await supabaseAdmin.from('submissions').select('*').or(`submitter_name.ilike.%${keyword}%,abstract.ilike.%${keyword}%`);
    results.supabase.submissions = sData;

    const { data: uData } = await supabaseAdmin.from('users').select('*').ilike('full_name', `%${keyword}%`).catch(() => ({data: []}));
    results.supabase.users = uData || [];

    // FIRESTORE
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();

      if (db) {
        const fetchAll = async (collectionName: string) => {
          const snap = await db.collection(collectionName).get();
          const docs: any[] = [];
          snap.forEach(doc => {
            const d = doc.data();
            if (JSON.stringify(d).toLowerCase().includes(keyword.toLowerCase())) docs.push({id: doc.id, ...d});
          });
          return docs;
        };

        results.firestore.users = await fetchAll('users');
        results.firestore.membership_applications = await fetchAll('membership_applications');
        results.firestore.submissions = await fetchAll('submissions');
      }
    } catch (fbErr: any) {
      results.firestore.error = fbErr.message;
    }

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json(results);
}
