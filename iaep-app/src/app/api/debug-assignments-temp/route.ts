import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('review_assignments')
    .select('*')
    .eq('submission_id', '7375625f-3137-3834-3436-393333383834');
    
  let firestoreData = [];
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const snap = await db.collection('review_assignments')
      .where('submission_id', '==', '7375625f-3137-3834-3436-393333383834')
      .get();
      
    snap.forEach(doc => firestoreData.push({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.log(e);
  }

  return NextResponse.json({ supabase: data, firestore: firestoreData });
}
