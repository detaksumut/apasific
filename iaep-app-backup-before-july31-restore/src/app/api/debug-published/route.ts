import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Ambil semua review_assignments (tanpa filter)
    const { data: allAssignments, error: err1 } = await supabaseAdmin
      .from('review_assignments')
      .select('*')
      .order('assigned_at', { ascending: false });

    // 2. Cek struktur tabel review_assignments
    const { data: tableInfo, error: err2 } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'review_assignments' })
      .select();

    // 3. Ambil semua submissions (tanpa filter status)
    const { data: allSubs, error: err3 } = await supabaseAdmin
      .from('submissions')
      .select('id, title, status, stage')
      .order('created_at', { ascending: false })
      .limit(5);

    // 4. Test insert ke review_assignments HANYA dengan reviewer_email (tanpa reviewer_id)
    let testResult: any = null;
    if (allSubs && allSubs.length > 0) {
      const testSubId = allSubs[0].id;
      
      // Test tanpa reviewer_id
      const { data: ins1, error: insErr1 } = await supabaseAdmin
        .from('review_assignments')
        .insert({
          submission_id: testSubId,
          reviewer_email: 'kadsumut@gmail.com',
          reviewer_name: 'Marahman Test',
          status: 'pending'
        })
        .select();

      testResult = {
        insert_without_reviewer_id: {
          success: !insErr1,
          error: insErr1?.message || null,
          data: ins1
        }
      };

      // Hapus data test jika berhasil
      if (ins1 && ins1.length > 0) {
        await supabaseAdmin.from('review_assignments').delete().eq('id', ins1[0].id);
        testResult.insert_without_reviewer_id.note = 'Test data deleted after check';
      }
    }

    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      all_assignments_count: allAssignments?.length || 0,
      all_assignments: allAssignments || [],
      all_assignments_error: err1?.message || null,
      recent_submissions: allSubs || [],
      submissions_error: err3?.message || null,
      test_insert: testResult,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
