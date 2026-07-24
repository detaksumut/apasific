import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();

    const targetDois = [
      "10.5281/zenodo.21474443",
      "10.5281/zenodo.21486466",
      "10.5281/zenodo.21483632"
    ];

    const logs: string[] = [];

    // 1. Restore in Supabase
    for (const doi of targetDois) {
      const { data: updated } = await supabaseAdmin
        .from('submissions')
        .update({ status: 'Published', stage: 'Production', updated_at: new Date() })
        .eq('doi', doi)
        .select();
      logs.push(`Supabase restored Published for DOI ${doi}: ${updated ? updated.length : 0} items`);
    }

    // 2. Restore in Firestore
    try {
      const snap = await db.collection('submissions').get();
      snap.forEach(async (doc: any) => {
        const d = doc.data();
        if (targetDois.includes(d.doi) || (d.title && targetDois.some(t => d.doi === t))) {
          await doc.ref.update({ status: 'Published', stage: 'Production', updated_at: new Date() });
          logs.push(`Firestore restored Published for doc ID ${doc.id}`);
        }
      });
    } catch(e: any) {
      logs.push(`Firestore restore error: ${e.message}`);
    }

    return NextResponse.json({ success: true, logs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
