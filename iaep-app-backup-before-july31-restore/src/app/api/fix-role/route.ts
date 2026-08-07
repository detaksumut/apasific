import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Update role for Dr. Arfan to 'editor'
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'editor' })
      .ilike('full_name', '%Arfan%');

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    return NextResponse.json({ success: true, message: "Dr. Arfan has been updated to Editor. Please refresh your dashboard." });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
