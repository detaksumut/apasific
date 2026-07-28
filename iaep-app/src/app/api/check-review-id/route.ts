import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: assignment } = await supabase
    .from('review_assignments')
    .select('*, submissions(*)')
    .eq('id', '96f81c78-3b82-4148-ae18-87ee9c577e8c')
    .single();

  const { data: submissionDirect } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', '96f81c78-3b82-4148-ae18-87ee9c577e8c')
    .maybeSingle();

  return NextResponse.json({
    assignment,
    submissionDirect
  });
}
