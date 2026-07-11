import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Try inserting a dummy profile to see if status column exists
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: "00000000-0000-0000-0000-000000000000",
      email: "test@example.com",
      status: "Pending"
    });

    return NextResponse.json({ success: true, upsertError });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, fullError: error }, { status: 200 });
  }
}
