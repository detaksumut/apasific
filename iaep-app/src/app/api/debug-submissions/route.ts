import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  let supabaseData = null;
  let firestoreData = null;

  try {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const { data, error } = await supabaseAdmin.from("submissions").select("*");
    supabaseData = { data, error };
  } catch (e: any) {
    supabaseData = { error: e.message };
  }

  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    const snapshot = await db.collection('submissions').get();
    firestoreData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e: any) {
    firestoreData = { error: e.message };
  }

  return NextResponse.json({
    supabase: supabaseData,
    firestore: firestoreData
  });
}
