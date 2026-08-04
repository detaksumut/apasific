import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    // 1. Get kadsumut profile from Supabase profiles
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .ilike('email', '%kadsumut%');

    let kadsumutId = profiles && profiles.length > 0 ? profiles[0].id : '4dOYvkkPwaONjE25qkiC1C5MOH53';
    const kadsumutEmail = 'kadsumut@gmail.com';

    // 2. Fix Supabase review_assignments
    const { data: allSbAssignments } = await supabaseAdmin
      .from('review_assignments')
      .select('*');

    let sbFixedCount = 0;
    if (allSbAssignments) {
      for (const assign of allSbAssignments) {
        const rId = (assign.reviewer_id || '').toLowerCase();
        const rEmail = (assign.reviewer_email || '').toLowerCase();

        if (rId.includes('1784054537519') || rId.includes('75736572') || rEmail.includes('kadsumut') || rId.includes('marahaman') || rId === 'kadsumut@gmail.com') {
          await supabaseAdmin
            .from('review_assignments')
            .update({
              reviewer_id: kadsumutId,
              reviewer_email: kadsumutEmail
            })
            .eq('id', assign.id);
          sbFixedCount++;
        }
      }
    }

    // 3. Fix Firestore review_assignments (Safely wrapped)
    let fbFixedCount = 0;
    try {
      const db = getFirestore();
      const fbAssignmentsSnap = await db.collection('review_assignments').get();
      const batch = db.batch();

      fbAssignmentsSnap.docs.forEach((doc: any) => {
        const data = doc.data();
        const rId = (data.reviewer_id || '').toLowerCase();
        const rEmail = (data.reviewer_email || '').toLowerCase();

        if (rId.includes('1784054537519') || rId.includes('75736572') || rEmail.includes('kadsumut') || rId.includes('marahaman') || rId === 'kadsumut@gmail.com') {
          batch.update(doc.ref, {
            reviewer_id: kadsumutId,
            reviewer_email: kadsumutEmail
          });
          fbFixedCount++;
        }
      });

      if (fbFixedCount > 0) {
        await batch.commit();
      }
    } catch (fbErr: any) {
      console.warn("Firestore fix skipped (quota):", fbErr?.message || fbErr);
    }

    return NextResponse.json({
      success: true,
      kadsumut_profile: profiles,
      supabase_fixed: sbFixedCount,
      firestore_fixed: fbFixedCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
