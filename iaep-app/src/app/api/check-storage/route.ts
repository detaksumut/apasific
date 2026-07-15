import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabaseAdmin.storage.from('manuscripts').list('sub_1784062294881_r2jx1m4');
    
    return NextResponse.json({ data, error });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
