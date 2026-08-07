import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const assignmentId = "5c82c156-f9f6-4415-a1cf-b9f1642a063a";
    const subUuid = "7375625f-3137-3834-3532-323331373834";

    // Update review_assignments
    const { error: err1 } = await supabaseAdmin
      .from("review_assignments")
      .update({
        status: "completed",
        updated_at: new Date()
      })
      .eq("id", assignmentId);

    // Update submissions
    const { error: err2 } = await supabaseAdmin
      .from("submissions")
      .update({
        status: "Reviewed",
        updated_at: new Date()
      })
      .eq("id", subUuid);

    return NextResponse.json({ success: true, err1, err2 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
