import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    // 1. Fetch all review_assignments
    const { data: supaAssignments, error: supaErr } = await supabaseAdmin
      .from('review_assignments')
      .select('*');

    // 2. Fetch all profiles
    const { data: profs, error: profsErr } = await supabaseAdmin
      .from('profiles')
      .select('*');

    // 3. Fetch all submissions
    const { data: subs, error: subsErr } = await supabaseAdmin
      .from('submissions')
      .select('id, submission_id, title, status');

    // 4. Fetch Firestore review_assignments
    let fbAssignments: any[] = [];
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const snap = await db.collection('review_assignments').get();
      snap.forEach((doc: any) => fbAssignments.push({ id: doc.id, ...doc.data() }));
    } catch (e: any) {
      fbAssignments = [{ error: e.message }];
    }

    return NextResponse.json({
       supaAssignments,
       supaErr: supaErr?.message || null,
       fbAssignments,
       profs,
       subs
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
