import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: determine role from access code vs session
async function validateAccessCode(
  sessionId: string,
  accessCode: string
): Promise<{ role: "assessor" | "candidate" | null; session: any | null }> {
  const { data, error } = await supabase
    .from("exam_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !data) return { role: null, session: null };

  if (data.assessor_code === accessCode) return { role: "assessor", session: data };
  if (data.candidate_code === accessCode) return { role: "candidate", session: data };
  return { role: null, session: null };
}

export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;

    // Require access code
    const accessCode = req.headers.get("x-access-code");
    if (!accessCode) {
      return NextResponse.json({ error: "Kode akses wajib disertakan." }, { status: 401 });
    }

    const { role, session } = await validateAccessCode(sessionId, accessCode);
    if (!role || !session) {
      return NextResponse.json({ error: "Kode akses tidak valid." }, { status: 403 });
    }

    // Candidate: check if access is locked
    if (role === "candidate" && session.access_locked) {
      return NextResponse.json(
        { error: "Ujian telah dikunci. Sesi Anda sudah disubmit dan tidak dapat diakses lagi.", locked: true },
        { status: 403 }
      );
    }

    // Filter response based on role
    if (role === "candidate") {
      // Strip correctAnswer from exam_data MCQs
      const safeExamData = session.exam_data
        ? {
            ...session.exam_data,
            mcqs: (session.exam_data.mcqs || []).map((mcq: any) => {
              const { correct, ...rest } = mcq; // remove correct answer key
              return rest;
            }),
          }
        : null;

      return NextResponse.json({
        id: session.id,
        certification_field: session.certification_field,
        status: session.status,
        access_locked: session.access_locked,
        exam_data: safeExamData,
        answer_data: session.answer_data, // candidate can see own answers
        score: session.score,
      });
    }

    // Assessor: return full data
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;

    // Require access code
    const accessCode = req.headers.get("x-access-code");
    if (!accessCode) {
      return NextResponse.json({ error: "Kode akses wajib disertakan." }, { status: 401 });
    }

    const { role, session } = await validateAccessCode(sessionId, accessCode);
    if (!role || !session) {
      return NextResponse.json({ error: "Kode akses tidak valid." }, { status: 403 });
    }

    const body = await req.json();

    // Candidate: cannot update if already locked
    if (role === "candidate" && session.access_locked) {
      return NextResponse.json(
        { error: "Ujian telah dikunci. Jawaban tidak dapat diubah." },
        { status: 403 }
      );
    }

    // Build update payload — allow partial updates
    const updatePayload: any = {};
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.exam_data !== undefined) updatePayload.exam_data = body.exam_data;
    if (body.answer_data !== undefined) updatePayload.answer_data = body.answer_data;
    if (body.score !== undefined) updatePayload.score = body.score;

    // Auto-lock and record timestamps on candidate submit
    if (body.status === "SUBMITTED" && role === "candidate") {
      updatePayload.access_locked = true;
      updatePayload.submitted_at = new Date().toISOString();
      updatePayload.attempt_count = (session.attempt_count || 0) + 1;
    }

    // Record started_at when status moves to IN_PROGRESS
    if (body.status === "IN_PROGRESS" && !session.started_at) {
      updatePayload.started_at = new Date().toISOString();
    }

    // Record completed_at when assessor completes assessment
    if (body.status === "ASSESSMENT_COMPLETED") {
      updatePayload.completed_at = new Date().toISOString();
    }

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("exam_sessions")
      .update(updatePayload)
      .eq("id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
