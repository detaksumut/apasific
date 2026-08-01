import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data } = await supabase.from('system_settings').select('*').eq('key', 'apasific_registered_users').single();
  const users = Array.isArray(data.value) ? data.value : JSON.parse(data.value);
  
  const passwords = {};
  for (const u of users) {
    if (u.email && u.email.includes('kadinmedan')) passwords[u.email] = u.password;
    if (u.email && u.email.includes('kadsumut')) passwords[u.email] = u.password;
  }
  
  return NextResponse.json(passwords);
}
