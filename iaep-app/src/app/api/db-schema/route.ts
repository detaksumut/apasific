import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: journals, error } = await supabase.from('journals').select('id, name, slug');

    if (error) {
       return NextResponse.json({ error: error });
    }

    return NextResponse.json({ journals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
