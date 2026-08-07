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

    const { data: supaSubs } = await supabaseAdmin.from('submissions').select('id, submission_id, title');

    let fbCompletedDocs: any[] = [];
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const snap = await db.collection('review_assignments').where('reviewer_email', '==', 'kadsumut@gmail.com').get();
      
      snap.forEach((doc: any) => {
        const d = doc.data();
        if (d.status === 'completed') {
          let title = "Judul Tidak Diketahui";
          if (supaSubs) {
            const matched = supaSubs.find(s => 
              s.id === d.submission_id || 
              s.submission_id === d.submission_id || 
              unhexUuid(s.id) === d.submission_id
            );
            if (matched) title = matched.title;
          }
          fbCompletedDocs.push({
            firestoreDocId: doc.id,
            submission_id: d.submission_id,
            reviewer_email: d.reviewer_email,
            status: d.status,
            recommendation: d.recommendation || d.decision || 'Accept',
            title
          });
        }
      });
    } catch(e: any) {
      return NextResponse.json({ error: e.message });
    }

    return NextResponse.json({
      completedCount: fbCompletedDocs.length,
      completedArticles: fbCompletedDocs
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
