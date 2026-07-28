import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const articleId = '7375625f-3137-3834-3535-333935303538';
  
  // Use a raw query to get column info
  const { data: colData, error: colError } = await supabase.rpc('get_columns', { table_name: 'submissions' });
  
  // Also try getting the row without specifying columns
  const { data, error } = await supabase
    .from('submissions')
    .select('id, status, stage, volume, issue, title')
    .eq('id', articleId)
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message, colError: colError?.message });
  }
  
  return NextResponse.json({ data, columns_in_row: Object.keys(data || {}) });
}
