import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { data, error } = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("id", params.sessionId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const body = await req.json();
    
    // allow partial updates to status, exam_data, answer_data, score
    const updatePayload: any = {};
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.exam_data !== undefined) updatePayload.exam_data = body.exam_data;
    if (body.answer_data !== undefined) updatePayload.answer_data = body.answer_data;
    if (body.score !== undefined) updatePayload.score = body.score;

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("exam_sessions")
      .update(updatePayload)
      .eq("id", params.sessionId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
