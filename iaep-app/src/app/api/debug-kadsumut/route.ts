import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Check Auth Users
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    const kadAuth = authData?.users?.filter(u => (u.email || '').toLowerCase().includes('kadsumut')) || [];

    // 2. Check Profiles
    const { data: profiles } = await supabaseAdmin.from('profiles').select('*');
    const kadProfiles = profiles?.filter(p =>
      (p.email || '').toLowerCase().includes('kadsumut') ||
      (p.full_name || '').toLowerCase().includes('marahaman')
    ) || [];

    // 3. Check system_settings
    const { data: settings } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .in('key', ['apasific_registered_users', 'registered_users']);

    let kadInSettings: any[] = [];
    if (settings) {
      settings.forEach((s: any) => {
        try {
          const parsed = Array.isArray(s.value) ? s.value : JSON.parse(s.value);
          const found = parsed.filter((u: any) => (u.email || '').toLowerCase().includes('kadsumut'));
          kadInSettings = [...kadInSettings, ...found];
        } catch (e) { }
      });
    }

    // 4. Check review_assignments
    const { data: assignments } = await supabaseAdmin.from('review_assignments').select('*');

    return NextResponse.json({
      success: true,
      in_auth_users: kadAuth,
      in_profiles_table: kadProfiles,
      in_system_settings: kadInSettings,
      review_assignments_count: assignments?.length || 0,
      assignments: assignments || []
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
