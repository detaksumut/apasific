import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!candidateId || !email) {
      return NextResponse.json({ error: "Candidate ID and Email are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certification_candidates")
      .select("id, name, cert, status, exam_questions, exam_time_limit, exam_score")
      .eq("id", candidateId)
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid credentials or candidate not found." }, { status: 404 });
    }

    if (data.status === "PASSED" || data.status === "FAILED") {
      return NextResponse.json({ 
        success: true, 
        completed: true, 
        score: data.exam_score, 
        status: data.status 
      });
    }

    if (data.status !== "Token Emailed") {
      return NextResponse.json({ error: "Your exam is not ready yet." }, { status: 403 });
    }

    if (!data.exam_questions) {
      return NextResponse.json({ error: "Exam questions have not been generated." }, { status: 404 });
    }

    // Strip correct answers before sending to frontend
    const questionsWithoutAnswers = data.exam_questions.map((q: any) => ({
      id: q.id,
      text: q.questionText,
      options: q.options
    }));

    return NextResponse.json({ 
      success: true, 
      timeLimit: data.exam_time_limit,
      questions: questionsWithoutAnswers
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const payload = await request.json();
    const { candidateId, email, answers } = payload; // answers is { "Q-001": "A", ... }

    if (!candidateId || !email || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: candidate, error: fetchError } = await supabase
      .from("certification_candidates")
      .select("id, exam_questions, status")
      .eq("id", candidateId)
      .eq("email", email)
      .single();

    if (fetchError || !candidate) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 404 });
    }

    if (candidate.status === "PASSED" || candidate.status === "FAILED") {
      return NextResponse.json({ error: "Exam already completed" }, { status: 400 });
    }

    // Auto Grading
    let score = 0;
    const questions = candidate.exam_questions || [];
    let maxScore = 0;

    questions.forEach((q: any) => {
      const qScore = q.score || 10;
      maxScore += qScore;
      if (answers[q.id] === q.correctAnswer) {
        score += qScore;
      }
    });

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const finalStatus = percentage >= 70 ? "PASSED" : "FAILED"; // Default passing grade 70%

    // Update DB
    const { data, error } = await supabase
      .from("certification_candidates")
      .update({
        exam_answers: answers,
        exam_score: Math.round(percentage),
        status: finalStatus
      })
      .eq("id", candidate.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      score: Math.round(percentage), 
      status: finalStatus 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
