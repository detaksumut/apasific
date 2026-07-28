import { NextResponse } from 'next/server';
import { ReviewAssignmentRepository } from '@/repositories/ReviewAssignmentRepository';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        // 1. Get true UUID of kadsumut
        const { data: prof } = await supabaseAdmin.from('profiles').select('id, email').eq('email', 'kadsumut@gmail.com').single();
        if (!prof) return NextResponse.json({ error: "No profile found" });
        const trueId = prof.id;

        // 2. Run the exact repository method the dashboard uses
        const assignments = await ReviewAssignmentRepository.getAssignmentsForReviewer(trueId, prof.email);

        // 3. See what Supabase has directly
        const { data: rawSupabase } = await supabaseAdmin
            .from("review_assignments")
            .select("*")
            .eq("reviewer_id", trueId);

        // 4. Group by status to see if it's there
        return NextResponse.json({ 
            trueId, 
            dashboardAssignmentsCount: assignments.length,
            dashboardAssignments: assignments.map(a => ({ id: a.id, status: a.status, sub_id: a.submission_id, assigned_at: a.assigned_at })),
            rawSupabaseCount: rawSupabase?.length,
            rawSupabase: rawSupabase?.map(a => ({ id: a.id, status: a.status, sub_id: a.submission_id, assigned_at: a.assigned_at }))
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}
