import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.from('submissions').select('*').limit(1);
    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return NextResponse.json({ columns, error });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
