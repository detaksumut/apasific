import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase.from('system_settings').select('*').in('key', ['apasific_registered_users', 'registered_users']);
  
  const result: Record<string, any> = {};
  for (const row of data) {
    if (typeof row.value === 'string' && row.value.includes('kadinmedan')) result[row.key] = true;
    else if (Array.isArray(row.value) && JSON.stringify(row.value).includes('kadinmedan')) result[row.key] = true;
    else result[row.key] = false;
  }
  
  return NextResponse.json(result);
}
