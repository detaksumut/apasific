import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('review_assignments').select('*').limit(5);
    
    return NextResponse.json({ success: true, data, error });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
