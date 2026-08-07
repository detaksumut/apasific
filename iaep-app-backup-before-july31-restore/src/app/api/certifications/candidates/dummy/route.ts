import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
  try {
    const dummyId = "C-" + Math.floor(Math.random() * 10000);
    
    const { error } = await supabase
      .from("certification_candidates")
      .insert([
        {
          id: dummyId,
          name: "Budi Santoso (Dummy)",
          email: "budi.dummy@example.com",
          cert: "Certified Academic Quality Auditor (CAQA)",
          method: "Online Exam",
          schedule: new Date().toISOString(),
          status: "Registered"
        }
      ]);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: dummyId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
