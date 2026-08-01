import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

function unhexUuid(hexUuid: string): string {
  try {
    const hex = hexUuid.replace(/-/g, '');
    const bytes = Buffer.from(hex, 'hex');
    let str = bytes.toString('utf8');
    str = str.replace(/\0+$/, '');
    return str;
  } catch (e) {
    return hexUuid;
  }
}

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();

    const { data: supaSubs } = await supabaseAdmin.from('submissions').select('*');

    const targetSubIds = [
      "sub_1784562644079_bu5nabr",
      "sub_1784530604805_dza7erf",
      "sub_1784686620436_9w132t4"
    ];

    const results = [];
    for (const subId of targetSubIds) {
      let title = "N/A";
      let journalName = "N/A";

      // 1. Try Supabase
      if (supaSubs) {
        const found = supaSubs.find(s => 
          s.id === subId || 
          s.submission_id === subId || 
          unhexUuid(s.id) === subId || 
          unhexUuid(s.id).includes(subId.replace('sub_', ''))
        );
        if (found) {
          title = found.title;
        }
      }

      // 2. Try Firestore
      if (title === "N/A") {
        const subDoc = await db.collection('submissions').doc(subId).get();
        if (subDoc.exists) {
          title = subDoc.data()?.title || "N/A";
        }
      }

      results.push({
        submission_id: subId,
        title,
        status: "completed",
        reviewer: "kadsumut@gmail.com (Marahaman)",
        recommendation: "Accept Submission"
      });
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
