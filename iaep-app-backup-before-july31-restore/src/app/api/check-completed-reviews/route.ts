import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Supabase assignments for kadsumut@gmail.com
    const { data: supaAll, error: supaErr } = await supabaseAdmin
      .from("review_assignments")
      .select("*, submissions(id, title)");

    // 2. Firestore assignments
    let fbAssignments: any[] = [];
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const snap = await db.collection('review_assignments').get();
      snap.forEach((doc: any) => {
        const d = doc.data();
        fbAssignments.push({ id: doc.id, ...d });
      });
    } catch(e: any) {
      fbAssignments = [{ error: e.message }];
    }

    return NextResponse.json({
      supaErr,
      totalSupabaseAssignments: supaAll ? supaAll.length : 0,
      supabaseCompleted: supaAll ? supaAll.filter(a => a.status === 'completed') : [],
      supabaseAssignments: supaAll,
      totalFirestoreAssignments: fbAssignments.length,
      firestoreCompleted: fbAssignments.filter(a => a.status === 'completed')
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
