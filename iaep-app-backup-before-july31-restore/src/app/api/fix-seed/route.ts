import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Fetch all editorial boards
    const { data: boards, error: fetchError } = await supabase
      .from("leadership")
      .select("body_name, members_json");

    if (fetchError) throw fetchError;

    const results = [];

    for (const board of boards) {
      if (board.body_name && board.body_name.startsWith("Editorial Board -")) {
        let members = [];
        try {
          members = typeof board.members_json === "string" ? JSON.parse(board.members_json) : board.members_json;
        } catch (e) {
          continue;
        }
        
        if (Array.isArray(members)) {
          // Filter to keep ONLY "Editor In Chief"
          const newMembers = members.filter(m => m.jabatan === "Editor In Chief");
          
          const { error: updateError } = await supabase
            .from("leadership")
            .update({ members_json: JSON.stringify(newMembers) })
            .eq("body_name", board.body_name);
            
          results.push({ body: board.body_name, success: !updateError, kept: newMembers.length });
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, fullError: error }, { status: 200 });
  }
}
