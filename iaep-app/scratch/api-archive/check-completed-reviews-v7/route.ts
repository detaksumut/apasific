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

    const { data: supaSubs } = await supabaseAdmin.from('submissions').select('id, title, submission_id');
    const fbSubsSnap = await db.collection('submissions').get();

    const fbSubsMap: Record<string, string> = {};
    fbSubsSnap.forEach((doc: any) => {
      fbSubsMap[doc.id] = doc.data()?.title;
    });

    const targetSubIds = [
      "sub_1784562644079_bu5nabr",
      "sub_1784530604805_dza7erf",
      "sub_1784686620436_9w132t4"
    ];

    const results = targetSubIds.map(subId => {
      let title = fbSubsMap[subId] || null;

      if (!title && supaSubs) {
        const found = supaSubs.find(s => 
          s.id === subId || 
          s.submission_id === subId || 
          unhexUuid(s.id) === subId || 
          unhexUuid(s.id).includes(subId.split('_')[1] || 'XYZ')
        );
        if (found) title = found.title;
      }

      return {
        submission_id: subId,
        title: title || "Judul Naskah (Data Ulasan Lengkap)"
      };
    });

    return NextResponse.json({
      allSupabaseCount: supaSubs ? supaSubs.length : 0,
      allFirestoreCount: fbSubsSnap.size,
      results
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
