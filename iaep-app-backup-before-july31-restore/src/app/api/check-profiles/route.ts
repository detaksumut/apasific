import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get profiles
    const { data: profiles } = await supabaseAdmin.from('profiles').select('*');

    // Also get system_settings users
    const { data: sysSettings } = await supabaseAdmin.from('system_settings').select('*');

    return NextResponse.json({ success: true, count: profiles?.length, profiles, sysSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
