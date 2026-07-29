import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const assignmentId = '769c61dc-d801-4251-8a9d-3f04fbace238';

    const { data: assignment } = await supabaseAdmin
      .from('review_assignments')
      .select('status, recommendation, comments_for_author, correction_notes')
      .eq('id', assignmentId)
      .single();

    return NextResponse.json({ success: true, assignment });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
