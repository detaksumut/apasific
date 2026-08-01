import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data, error } = await supabase.from('system_settings').select('*').in('key', ['apasific_registered_users', 'registered_users']);
  if (error) return NextResponse.json({ error: error.message });
  
  let found = false;
  for (const row of data) {
    if (typeof row.value === 'string' && row.value.includes('kadinmedan1')) found = true;
    if (Array.isArray(row.value) && JSON.stringify(row.value).includes('kadinmedan1')) found = true;
  }

  return NextResponse.json({
    kadinmedan_in_settings: found,
    rows: data.length
  });
}
