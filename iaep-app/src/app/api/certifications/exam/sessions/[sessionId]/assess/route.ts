import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/certifications/exam/sessions/[sessionId]/assess
 *
 * Assessor submits their evaluation of a candidate's exam.
 * Requires assessor's access code via x-access-code header.
 *
 * Flow:
 *   1. Validate assessor access code
 *   2. Validate session status is SUBMITTED or UNDER_REVIEW
 *   3. Insert into assessment_results
 *   4. Update exam_sessions.status → ASSESSMENT_COMPLETED
 *   5. Insert into certification_audit_logs
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // 1. Validate assessor access code
    const accessCode = req.headers.get("x-access-code");
    if (!accessCode) {
      return NextResponse.json({ error: "Kode akses wajib disertakan." }, { status: 401 });
    }

    const { data: session, error: sessionErr } = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionErr || !session) {
      return NextResponse.json({ error: "Sesi ujian tidak ditemukan." }, { status: 404 });
    }

    if (session.assessor_code !== accessCode) {
      return NextResponse.json({ error: "Kode akses asesor tidak valid." }, { status: 403 });
    }

    // 2. Validate status
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(session.status)) {
      return NextResponse.json(
        { error: `Tidak dapat menilai sesi dengan status: ${session.status}. Harus SUBMITTED atau UNDER_REVIEW.` },
        { status: 400 }
      );
    }

    // 3. Parse request body
    const body = await req.json();
    const { essayScore, interviewScore, recommendation, notes, assessorName } = body;

    if (!recommendation || !['CERTIFIED', 'FAILED', 'NEEDS_INTERVIEW', 'PENDING_REVIEW'].includes(recommendation)) {
      return NextResponse.json(
        { error: "Rekomendasi wajib diisi: CERTIFIED | FAILED | NEEDS_INTERVIEW | PENDING_REVIEW" },
        { status: 400 }
      );
    }

    // 4. Auto-calculate MCQ score from answer_data
    let mcqScore = 0;
    let mcqMaxScore = 0;
    const examMcqs: any[] = session.exam_data?.mcqs || [];
    const candidateMcqAnswers: Record<string, string> = session.answer_data?.mcqs || {};

    if (examMcqs.length > 0) {
      for (const mcq of examMcqs) {
        const questionScore = mcq.score || 10;
        mcqMaxScore += questionScore;
        if (candidateMcqAnswers[mcq.id]?.toUpperCase() === mcq.correct?.toUpperCase()) {
          mcqScore += questionScore;
        }
      }
      // Normalize to 0–100
      mcqScore = mcqMaxScore > 0 ? Math.round((mcqScore / mcqMaxScore) * 100) : 0;
    }

    const finalEssayScore = Number(essayScore) || 0;
    const finalInterviewScore = Number(interviewScore) || 0;

    // Weighted final score: MCQ 50%, Essay 30%, Interview 20%
    const hasInterview = session.exam_data?.interviewLink;
    let finalScore: number;
    if (hasInterview) {
      finalScore = Math.round(mcqScore * 0.5 + finalEssayScore * 0.3 + finalInterviewScore * 0.2);
    } else {
      // No interview: MCQ 60%, Essay 40%
      finalScore = Math.round(mcqScore * 0.6 + finalEssayScore * 0.4);
    }

    // 5. Insert assessment_results
    const { data: assessmentResult, error: arErr } = await supabase
      .from("assessment_results")
      .insert({
        exam_session_id: sessionId,
        mcq_score: mcqScore,
        essay_score: finalEssayScore,
        interview_score: finalInterviewScore,
        final_score: finalScore,
        passing_threshold: 70,
        recommendation,
        assessor_id: session.assessor_id || assessorName || "Unknown Assessor",
        notes: notes || null,
        reviewer_count: 1,
      })
      .select()
      .single();

    if (arErr) {
      return NextResponse.json({ error: "Gagal menyimpan hasil penilaian: " + arErr.message }, { status: 500 });
    }

    // 6. Update exam_sessions status → ASSESSMENT_COMPLETED + store final score
    const { error: updateErr } = await supabase
      .from("exam_sessions")
      .update({
        status: "ASSESSMENT_COMPLETED",
        score: finalScore,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (updateErr) {
      return NextResponse.json({ error: "Gagal update status sesi: " + updateErr.message }, { status: 500 });
    }

    // 7. Insert audit log
    await supabase.from("certification_audit_logs").insert({
      entity_type: "exam_session",
      entity_id: sessionId,
      action: "ASSESSOR_SUBMIT_REVIEW",
      performed_by: `Assessor:${assessorName || session.assessor_id || "Unknown"}`,
      old_value: { status: session.status },
      new_value: {
        status: "ASSESSMENT_COMPLETED",
        recommendation,
        final_score: finalScore,
        mcq_score: mcqScore,
        essay_score: finalEssayScore,
        interview_score: finalInterviewScore,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Penilaian berhasil disimpan. Status sesi diubah ke ASSESSMENT_COMPLETED.",
      assessment: {
        id: assessmentResult.id,
        mcq_score: mcqScore,
        essay_score: finalEssayScore,
        interview_score: finalInterviewScore,
        final_score: finalScore,
        recommendation,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
