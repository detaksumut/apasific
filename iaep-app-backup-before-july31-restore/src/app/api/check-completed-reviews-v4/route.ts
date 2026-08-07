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

    const targetSubIds = [
      "sub_1784562644079_bu5nabr",
      "sub_1784530604805_dza7erf",
      "sub_1784686620436_9w132t4"
    ];

    const results = [];
    for (const subId of targetSubIds) {
      let title = "N/A";
      const subDoc = await db.collection('submissions').doc(subId).get();
      if (subDoc.exists) {
        title = subDoc.data()?.title || "N/A";
      }

      if (title === "N/A" || title === "Judul Tidak Ditemukan") {
        const { data: supaMatch } = await supabaseAdmin.from('submissions').select('id, title').ilike('id', `%${subId.split('_')[1]}%`).maybeSingle();
        if (supaMatch?.title) title = supaMatch.title;
      }

      results.push({
        submission_id: subId,
        title
      });
    }

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
