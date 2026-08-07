import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const articleId = '7375625f-3137-3834-3535-333935303538';
  
  const { data, error } = await supabase
    .from('submissions')
    .select('id, status, stage, volume, issue, author, updated_at')
    .eq('id', articleId)
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message });
  }
  
  return NextResponse.json(data);
}
