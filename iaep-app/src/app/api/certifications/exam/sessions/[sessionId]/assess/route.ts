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
 * Phase 6.1: Scoring weights and passing_grade driven by certification_policies.
 * Phase 6.4: Panel mode — if assessor_assignments exist for this session,
 *   records individual score per assessor and waits for all to submit
 *   before computing weighted average and marking ASSESSMENT_COMPLETED.
 *
 * SINGLE MODE (backward compatible):
 *   assessor_code in exam_sessions.assessor_code → immediate ASSESSMENT_COMPLETED
 *
 * PANEL MODE (Phase 6.4):
 *   assessor_code in assessor_assignments → partial submit →
 *   all submitted → weighted average → ASSESSMENT_COMPLETED
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

    // Check session assessor auth:
    // PANEL mode: check assessor_assignments; SINGLE mode: check session.assessor_code
    const { data: panelAssignments } = await supabase
      .from("assessor_assignments")
      .select("*")
      .eq("exam_session_id", sessionId);

    const isPanelMode = (panelAssignments?.length ?? 0) > 1;

    if (isPanelMode) {
      // Panel mode: assessor must be in the assignments list
      const myAssignment = panelAssignments!.find((a) => a.assessor_code === accessCode);
      if (!myAssignment) {
        return NextResponse.json(
          { error: "Kode akses tidak ditemukan dalam panel sesi ini." },
          { status: 403 }
        );
      }
      if (myAssignment.submitted_at) {
        return NextResponse.json(
          { error: "Anda sudah submit penilaian untuk sesi ini." },
          { status: 409 }
        );
      }
    } else {
      // Single mode: original validation
      if (session.assessor_code !== accessCode) {
        return NextResponse.json({ error: "Kode akses asesor tidak valid." }, { status: 403 });
      }
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

    // 3. Lookup Certification Policy (Phase 6.1 — policy-driven scoring)
    // Match by certification_field → policy.code (case-insensitive)
    const certField = (session.certification_field || "").toUpperCase();
    const { data: policy } = await supabase
      .from("certification_policies")
      .select("passing_grade, mcq_weight, essay_weight, interview_weight, validity_years, reviewer_count")
      .eq("is_active", true)
      .or(`code.eq.${certField},name.ilike.%${session.certification_field}%`)
      .limit(1)
      .maybeSingle();

    // Fallback defaults if policy not found (backward compatible)
    const passingGrade    = policy?.passing_grade    ?? 70;
    const mcqWeight       = policy?.mcq_weight       ?? 0.60;
    const essayWeight     = policy?.essay_weight     ?? 0.40;
    const interviewWeight = policy?.interview_weight ?? 0.00;
    const policyReviewerCount = policy?.reviewer_count ?? 1;

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
      mcqScore = mcqMaxScore > 0 ? Math.round((mcqScore / mcqMaxScore) * 100) : 0;
    }

    const finalEssayScore     = Number(essayScore)     || 0;
    const finalInterviewScore = Number(interviewScore) || 0;

    // Policy-driven weighted final score
    const finalScore = Math.round(
      mcqScore       * Number(mcqWeight)       +
      finalEssayScore * Number(essayWeight)    +
      finalInterviewScore * Number(interviewWeight)
    );

    // ── PANEL MODE: Record individual submission, check if panel is complete ──
    if (isPanelMode) {
      const myAssignment = panelAssignments!.find((a) => a.assessor_code === accessCode)!;

      // Record this assessor's individual scores in assessor_assignments
      await supabase
        .from("assessor_assignments")
        .update({
          mcq_score: mcqScore,
          essay_score: finalEssayScore,
          interview_score: finalInterviewScore,
          individual_score: finalScore,
          recommendation,
          notes: notes || null,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", myAssignment.id);

      // Re-fetch to check if all panel members have submitted
      const { data: updatedAssignments } = await supabase
        .from("assessor_assignments")
        .select("*")
        .eq("exam_session_id", sessionId);

      const allSubmitted = updatedAssignments!.every((a) => a.submitted_at !== null);
      const submittedCount = updatedAssignments!.filter((a) => a.submitted_at !== null).length;
      const totalCount = updatedAssignments!.length;

      await supabase.from("certification_audit_logs").insert({
        entity_type: "exam_session",
        entity_id: sessionId,
        action: "PANEL_ASSESSOR_SUBMIT",
        performed_by: `Assessor:${accessCode}`,
        new_value: {
          assessor_code: accessCode,
          role: myAssignment.role,
          individual_score: finalScore,
          submitted: submittedCount,
          total: totalCount,
          panel_complete: allSubmitted,
        },
      });

      if (!allSubmitted) {
        // Panel not yet complete — keep status UNDER_REVIEW
        await supabase.from("exam_sessions").update({ status: "UNDER_REVIEW", updated_at: new Date().toISOString() }).eq("id", sessionId);

        return NextResponse.json({
          success: true,
          panel_mode: true,
          message: `Penilaian Anda berhasil disimpan. Menunggu ${totalCount - submittedCount} asesor lain menyelesaikan penilaian.`,
          progress: { submitted: submittedCount, total: totalCount },
        });
      }

      // All panel members submitted → compute weighted average final score
      const weightedSum = updatedAssignments!.reduce(
        (sum, a) => sum + (Number(a.individual_score) || 0) * Number(a.weight),
        0
      );
      const totalWeight = updatedAssignments!.reduce((sum, a) => sum + Number(a.weight), 0);
      const panelFinalScore = Math.round(weightedSum / totalWeight);

      // Majority recommendation
      const recs = updatedAssignments!.map((a) => a.recommendation).filter(Boolean);
      const certifiedCount = recs.filter((r) => r === "CERTIFIED").length;
      const panelRecommendation = certifiedCount > recs.length / 2 ? "CERTIFIED" : "FAILED";

      // Build panel_scores breakdown
      const panelScores = updatedAssignments!.map((a) => ({
        assessor_code: a.assessor_code,
        role: a.role,
        weight: a.weight,
        score: a.individual_score,
        recommendation: a.recommendation,
      }));

      // 5. Insert assessment_results (panel)
      const { data: assessmentResult, error: arErr } = await supabase
        .from("assessment_results")
        .insert({
          exam_session_id: sessionId,
          mcq_score: null, // Panel: individual MCQ not aggregated here
          essay_score: null,
          interview_score: null,
          final_score: panelFinalScore,
          passing_threshold: passingGrade,
          recommendation: panelRecommendation,
          assessor_id: `Panel(${totalCount})`,
          notes: `Panel of ${totalCount} assessors. Weighted average.`,
          reviewer_count: totalCount,
          panel_scores: panelScores,
        })
        .select()
        .single();

      if (arErr) return NextResponse.json({ error: "Gagal simpan hasil panel: " + arErr.message }, { status: 500 });

      // 6. Update session → ASSESSMENT_COMPLETED with panel score
      await supabase.from("exam_sessions").update({
        status: "ASSESSMENT_COMPLETED",
        score: panelFinalScore,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", sessionId);

      await supabase.from("certification_audit_logs").insert({
        entity_type: "exam_session",
        entity_id: sessionId,
        action: "PANEL_ASSESSMENT_COMPLETED",
        performed_by: "System (Panel)",
        new_value: {
          status: "ASSESSMENT_COMPLETED",
          panel_final_score: panelFinalScore,
          panel_recommendation: panelRecommendation,
          total_assessors: totalCount,
          passing_grade: passingGrade,
        },
      });

      return NextResponse.json({
        success: true,
        panel_mode: true,
        panel_complete: true,
        message: `Panel assessment selesai. Skor akhir: ${panelFinalScore} (dari ${totalCount} asesor).`,
        assessment: {
          id: assessmentResult.id,
          final_score: panelFinalScore,
          recommendation: panelRecommendation,
          panel_scores: panelScores,
        },
      });
    }

    // ── SINGLE MODE (original flow — backward compatible) ──

    // 5. Insert assessment_results
    const { data: assessmentResult, error: arErr } = await supabase
      .from("assessment_results")
      .insert({
        exam_session_id: sessionId,
        mcq_score: mcqScore,
        essay_score: finalEssayScore,
        interview_score: finalInterviewScore,
        final_score: finalScore,
        passing_threshold: passingGrade,
        recommendation,
        assessor_id: session.assessor_id || assessorName || "Unknown Assessor",
        notes: notes || null,
        reviewer_count: policyReviewerCount,
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
        passing_grade: passingGrade,
        policy_driven: !!policy,
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
