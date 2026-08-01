import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message });
  
  const emails = data.users.map(u => u.email);
  return NextResponse.json({
    total: emails.length,
    kadinmedan1: emails.includes('kadinmedan1@gmail.com'),
    kadsumut: emails.includes('kadsumut@gmail.com'),
    detaksumut: emails.includes('detaksumut@gmail.com'),
    emails: emails
  });
}
