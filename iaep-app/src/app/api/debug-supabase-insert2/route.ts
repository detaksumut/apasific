import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Hardcode test data
    const submissionId = "7375625f-3137-3834-3436-353736303538";
    const { data: prof } = await supabaseAdmin.from('profiles').select('id').eq('email', 'kadsumut@gmail.com').single();
    if (!prof) return NextResponse.json({ error: "No profile found" });
    const trueId = prof.id;

    // Use a random timestamp to ensure we insert something new (if unique constraint allows)
    const assignmentDataSupabase = {
        submission_id: submissionId,
        reviewer_id: trueId,
        reviewer_email: 'kadsumut@gmail.com',
        reviewer_name: 'Marahaman',
        status: 'pending',
        assigned_at: new Date().toISOString()
    };
    
    const { data, error } = await supabaseAdmin
        .from('review_assignments')
        .insert(assignmentDataSupabase)
        .select('id')
        .single();
        
    return NextResponse.json({ data, error, message: "Attempting to insert without round" });
}
