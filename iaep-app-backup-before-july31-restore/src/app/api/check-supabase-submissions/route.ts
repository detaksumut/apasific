import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Count total submissions
    const { count: totalCount } = await supabaseAdmin
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    // Get all submissions
    const { data: submissions, error } = await supabaseAdmin
      .from('submissions')
      .select('id, title, status, stage, journal_id, created_at, journals(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by status
    const byStatus: Record<string, number> = {};
    (submissions || []).forEach((s: any) => {
      const key = s.status || 'unknown';
      byStatus[key] = (byStatus[key] || 0) + 1;
    });

    return NextResponse.json({
      total_in_supabase: totalCount,
      by_status: byStatus,
      submissions: (submissions || []).map((s: any) => ({
        id: s.id,
        title: s.title?.substring(0, 70),
        status: s.status,
        stage: s.stage,
        journal: (s.journals as any)?.name || s.journal_id,
        created_at: s.created_at,
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
