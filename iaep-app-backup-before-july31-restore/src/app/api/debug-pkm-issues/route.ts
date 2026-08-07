import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const result: any = {
    ajcs_journal_uuid: '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d',
    issues_in_supabase: [],
    issues_in_firestore: []
  };

  try {
    const { data: issues } = await supabase.from('journal_issues').select('*').eq('journal_id', '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d');
    result.issues_in_supabase = issues || [];
  } catch(e: any) {
    result.supabase_error = e.message;
  }

  try {
    const db = getFirestore();
    const snap = await db.collection('journal_issues').where('journal_id', '==', '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d').get();
    const issues = snap.docs.map((doc: any) => ({id: doc.id, ...doc.data()}));
    result.issues_in_firestore = issues;
  } catch(e: any) {
    result.firestore_error = e.message;
  }
  
  // also check published articles if they are stored elsewhere
  try {
     const { data: pub_articles } = await supabase.from('published_articles').select('*').eq('journal_id', '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d');
     result.published_articles_in_supabase = pub_articles || [];
  } catch(e: any) {}

  return NextResponse.json(result);
}
