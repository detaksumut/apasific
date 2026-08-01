import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: supaSubs } = await supabaseAdmin.from('submissions').select('id, submission_id, title');

    return NextResponse.json({
      allSubmissions: supaSubs
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
