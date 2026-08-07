import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase.from('submissions').select('*').eq('journal_id', '6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d');
  return NextResponse.json({ supabase_pkm_submissions: data });
}
