import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    // Find profiles for kadsumut or Marahaman
    const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
    const kadProfile = profiles?.find(p => 
       (p.email || '').toLowerCase().includes('kadsumut') || 
       (p.full_name || '').toLowerCase().includes('marahaman')
    );

    let reviewerId = kadProfile?.id;
    if (!reviewerId) {
      // Look up auth user
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      const kadAuth = authData?.users?.find(u => (u.email || '').toLowerCase().includes('kadsumut'));
      reviewerId = kadAuth?.id || '4dOYvkkPwaONjE25qkiC1C5MOH53';
    }

    // Ensure profile exists in profiles table
    await supabaseAdmin.from('profiles').upsert({
       id: reviewerId,
       full_name: 'Marahaman (Reviewer)',
       email: 'kadsumut@gmail.com',
       role: 'reviewer'
    }, { onConflict: 'id' });

    // Target 2 active submissions from editor:
    // 1. ECONOMIC MORALITY IN DIGITAL TRANSACTIONS
    // 2. Zakat and Tax Accounting
    const targetSubIds = [
       "7375625f-3137-3834-3732-343632393732",
       "7375625f-3137-3834-3532-323331373834"
    ];

    let createdAssignments = [];
    for (const subId of targetSubIds) {
       const { data: insData, error: insErr } = await supabaseAdmin
         .from('review_assignments')
         .insert({
            submission_id: subId,
            reviewer_id: reviewerId,
            reviewer_email: 'kadsumut@gmail.com',
            status: 'pending',
            assigned_at: new Date().toISOString()
         })
         .select('*');

       if (!insErr && insData) {
          createdAssignments.push(...insData);
       } else if (insErr) {
          console.warn("Insert warn:", insErr.message);
       }
    }

    const { data: currentAssignments } = await supabaseAdmin
      .from('review_assignments')
      .select('*, submissions(*, journals(name))');

    return NextResponse.json({
      success: true,
      reviewerId,
      createdAssignments,
      total_in_db: currentAssignments?.length || 0,
      currentAssignments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
