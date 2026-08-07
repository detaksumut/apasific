import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Read system_settings users
    const { data: settings } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .in('key', ['apasific_registered_users', 'registered_users']);

    let allUsers: any[] = [];
    if (settings) {
       settings.forEach((s: any) => {
          try {
             const parsed = Array.isArray(s.value) ? s.value : JSON.parse(s.value);
             allUsers = [...allUsers, ...parsed];
          } catch(e) {}
       });
    }

    const { data: cols } = await supabaseAdmin.from('information_schema.columns').select('column_name, data_type').eq('table_name', 'profiles');

    let profileErrors: any[] = [];
    for (const u of allUsers) {
       if (!u.id) continue;
       
       let targetId = u.id;
       // If id is not a UUID and table expects UUID, convert to normalized UUID
       if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
           const hex = Buffer.from(targetId).toString('hex').padEnd(32, '0').slice(0, 32);
           targetId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
       }

       const { error } = await supabaseAdmin.from('profiles').upsert({
          id: targetId,
          full_name: u.full_name || 'User',
          email: u.email || `${targetId}@user.local`,
          role: u.role || 'reviewer'
       }, { onConflict: 'id' });

       if (error) {
          profileErrors.push({ originalId: u.id, targetId, error: error.message });
       }
    }

    // 2. Insert assignments for kadsumut@gmail.com
    const kadUser = allUsers.find(u => (u.email || '').toLowerCase().includes('kadsumut'));
    const kadId = kadUser ? kadUser.id : 'demo-user-1784054537519';

    // Target 2 submissions
    const targetSubIds = [
       "7375625f-3137-3834-3732-343632393732",
       "7375625f-3137-3834-3532-323331373834"
    ];

    let insertedAssignments = 0;
    for (const subId of targetSubIds) {
       const { data: insData, error: assignErr } = await supabaseAdmin
         .from('review_assignments')
         .upsert({
            submission_id: subId,
            reviewer_id: kadId,
            reviewer_email: 'kadsumut@gmail.com',
            status: 'pending',
            assigned_at: new Date().toISOString()
         })
         .select('*');

       if (!assignErr && insData) {
          insertedAssignments += insData.length;
       } else if (assignErr) {
          console.error("Assign err:", assignErr.message);
       }
    }

    const { data: currentAssignments } = await supabaseAdmin
      .from('review_assignments')
      .select('*, submissions(*, journals(name))');

    return NextResponse.json({
      success: true,
      profileErrorsCount: profileErrors.length,
      profileErrors: profileErrors.slice(0, 5),
      kadUser,
      insertedAssignments,
      totalAssignmentsInDb: currentAssignments?.length || 0,
      currentAssignments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
