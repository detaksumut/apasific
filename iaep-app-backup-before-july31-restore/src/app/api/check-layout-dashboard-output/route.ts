import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: queue } = await supabaseAdmin
      .from("submissions")
      .select("id, title, status")
      .in("status", ["Assigned to Layout", "In Layout"]);

    const layoutDoneStatuses = [
      "Layout Completed", 
      "Assigned to Cover", 
      "Cover Completed", 
      "Assigned to Publisher", 
      "Published", 
      "Production Completed"
    ];

    const { data: done } = await supabaseAdmin
      .from("submissions")
      .select("id, title, status, doi")
      .in("status", layoutDoneStatuses);

    return NextResponse.json({
      antreanLayoutCount: queue?.length || 0,
      antreanLayout: queue,
      riwayatLayoutCount: done?.length || 0,
      riwayatLayout: done
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
