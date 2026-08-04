import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    // 1. List all auth users to find kadsumut@gmail.com
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const authUsers = authData?.users || [];
    const kadsumutAuth = authUsers.find(u => (u.email || '').toLowerCase().includes('kadsumut'));

    // 2. List all profiles
    const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
    const kadsumutProfile = profiles?.find(p => 
      (p.email || '').toLowerCase().includes('kadsumut') || 
      (p.full_name || '').toLowerCase().includes('kadsumut') ||
      (p.full_name || '').toLowerCase().includes('marahaman')
    );

    // 3. Read Firestore review_assignments and sync into Supabase
    let syncedFromFirestore = 0;
    const resolvedProfileId = kadsumutProfile?.id || kadsumutAuth?.id;
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const fbSnap = await db.collection('review_assignments').get();
      
      for (const doc of fbSnap.docs) {
         const data = doc.data();
         const targetReviewerId = resolvedProfileId || data.reviewer_id || 'demo-user-1784054537519';
         
         const { error: insErr } = await supabaseAdmin.from('review_assignments').upsert({
            id: doc.id.includes('-') ? doc.id : undefined,
            submission_id: data.submission_id,
            reviewer_id: targetReviewerId,
            reviewer_email: 'kadsumut@gmail.com',
            status: data.status || 'pending',
            assigned_at: data.created_at?.toDate ? data.created_at.toDate() : new Date()
         });

         if (!insErr) syncedFromFirestore++;
         else console.warn("Supabase insert warning:", insErr.message);
      }
    } catch(e: any) {
      console.warn("Firestore read skipped (quota):", e?.message || e);
    }

    const { data: finalAssignments } = await supabaseAdmin.from('review_assignments').select('*');

    return NextResponse.json({
      success: true,
      kadsumut_auth: kadsumutAuth ? { id: kadsumutAuth.id, email: kadsumutAuth.email } : null,
      kadsumut_profile: kadsumutProfile,
      activeProfileId: resolvedProfileId ?? null,
      syncedFromFirestore,
      assignments_in_db: finalAssignments?.length || 0,
      finalAssignments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
