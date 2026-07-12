import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch all users from auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Fetch all profiles
    const { data: profilesData, error: profError } = await supabaseAdmin.from('profiles').select('*');
    if (profError) throw profError;

    // Combine them
    const syncedUsers = authData.users.map(u => {
      const p = profilesData.find(prof => prof.id === u.id) || {};
      return {
        id: u.id,
        email: u.email,
        full_name: p.full_name || 'Unknown',
        university: p.university || '',
        country: p.country || '',
        role: p.role || 'author',
        status: p.status || 'Active',
        joined: u.created_at,
        password: "ReviewerPassword123!" // Mock password for display if needed
      };
    });

    // Update system_settings
    const { error: upsertError } = await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'registered_users', value: JSON.stringify(syncedUsers) });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, message: `Successfully synced ${syncedUsers.length} users into system_settings!`, users: syncedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
