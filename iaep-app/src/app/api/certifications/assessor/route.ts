import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessCode = searchParams.get('code');

    if (!accessCode) {
      return NextResponse.json({ error: "Access Code is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certification_candidates")
      .select("id, name, cert, method, status, exam_questions, exam_time_limit")
      .eq("assessor_access_code", accessCode)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid Access Code" }, { status: 404 });
    }

    return NextResponse.json({ success: true, candidate: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload = await request.json();
    const { accessCode, questions, timeLimit } = payload;

    if (!accessCode || !questions || !timeLimit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify access code
    const { data: candidate, error: fetchError } = await supabase
      .from("certification_candidates")
      .select("id")
      .eq("assessor_access_code", accessCode)
      .single();

    if (fetchError || !candidate) {
      return NextResponse.json({ error: "Invalid Access Code" }, { status: 404 });
    }

    // Update candidate record with exam data and change status
    const { data, error } = await supabase
      .from("certification_candidates")
      .update({
        exam_questions: questions,
        exam_time_limit: timeLimit,
        status: "Token Emailed"
      })
      .eq("id", candidate.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Exam generated successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
