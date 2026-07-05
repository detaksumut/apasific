import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certification_mcq_bank")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = data.map(q => ({
      id: q.id,
      scheme: q.scheme,
      questionText: q.question_text,
      options: q.options,
      correctAnswer: q.correct_answer,
      score: q.score
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload = await request.json();
    const { id, scheme, questionText, options, correctAnswer, score } = payload;

    if (!scheme || !questionText || !options || !correctAnswer) {
      return NextResponse.json({ error: "Missing required fields for question" }, { status: 400 });
    }

    const dbPayload = {
      id: id || `Q-${Date.now().toString().slice(-4)}`,
      scheme,
      question_text: questionText,
      options,
      correct_answer: correctAnswer,
      score: score || 10,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("certification_mcq_bank")
      .upsert(dbPayload, { onConflict: "id" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("certification_mcq_bank")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
