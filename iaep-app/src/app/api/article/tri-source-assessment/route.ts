import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId') || searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Fetch Screening Data (SCREEN Layer)
    const { data: screening } = await supabaseAdmin
      .from('ai_reviewer_assessments')
      .select('novelty_rating, methodology_rating, clarity_rating, confidence_score, summary_evaluation, suggested_improvements, model_name, prompt_version, created_at')
      .eq('submission_id', submissionId)
      .maybeSingle();

    // 2. Fetch UltimateAI Score Data (SCORE Layer)
    const { data: scoreSetting } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', `ultimateai_score_${submissionId}`)
      .maybeSingle();

    let scoreData = null;
    if (scoreSetting?.value) {
      scoreData = typeof scoreSetting.value === 'string' ? JSON.parse(scoreSetting.value) : scoreSetting.value;
    }

    // 3. Fetch Completed Peer Reviews / Evidence (CLUE Layer)
    // NOTE: comments_for_editor is STRICTLY EXCLUDED for public privacy governance
    const { data: reviews } = await supabaseAdmin
      .from('review_assignments')
      .select('id, reviewer_name, status, recommendation, comments_for_author, correction_notes, completed_at')
      .eq('submission_id', submissionId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    // 4. Fetch Submission Metadata for deterministic fallback
    const { data: sub } = await supabaseAdmin
      .from('submissions')
      .select('id, title, abstract, doi, created_at')
      .eq('id', submissionId)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      submissionId,
      screening: screening || null,
      score: scoreData || null,
      clueReviews: reviews || [],
      submission: sub || null
    });
  } catch (err: any) {
    console.error('[tri-source-assessment] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
