import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";
import { createClient } from "@/utils/supabase/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const result: any = { 
       firestore_settings: [],
       supabase_settings: null
    };
    
    // Check Firestore
    const db = getFirestore();
    const snap = await db.collection('system_settings').get();
    for (const doc of snap.docs) {
       result.firestore_settings.push({ id: doc.id, ...doc.data() });
    }

    // Check Supabase
    const { data: ss } = await supabase.from('system_settings').select('*').limit(10);
    result.supabase_settings = ss;

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
