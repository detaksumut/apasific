import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('submissions').select('id, title, stage, status');
  
  if (error) return NextResponse.json({ error: error.message });
  
  return NextResponse.json({ data });
}
