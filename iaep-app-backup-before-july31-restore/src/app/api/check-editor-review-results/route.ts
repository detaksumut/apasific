import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Fetch completed review assignments
    const { data: assignments } = await supabaseAdmin
      .from('review_assignments')
      .select('*, submissions(*, journals(name))')
      .eq('status', 'completed');

    // 2. Fetch Zakat submission specifically
    const { data: zakatSub } = await supabaseAdmin
      .from('submissions')
      .select('*, journals(name)')
      .ilike('title', '%Zakat%');

    return NextResponse.json({
      zakatSubmissionInDB: zakatSub,
      completedAssignmentsInDB: assignments
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
