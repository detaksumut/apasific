import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/certifications/exam/sessions/[sessionId]/assign
 * Tampilkan semua panel assessors yang ditugaskan ke sesi ini.
 * Termasuk status submit (submitted_at null = pending).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const { data, error } = await supabase
    .from("assessor_assignments")
    .select("*")
    .eq("exam_session_id", sessionId)
    .order("role") // LEAD first
    .order("assigned_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Summary: berapa yang sudah submit vs total
  const total = data.length;
  const submitted = data.filter((a) => a.submitted_at !== null).length;
  const pending = total - submitted;

  return NextResponse.json({
    assignments: data,
    summary: { total, submitted, pending, panel_complete: total > 0 && pending === 0 },
  });
}

/**
 * POST /api/certifications/exam/sessions/[sessionId]/assign
 * Admin menambahkan assessor ke panel sesi ujian ini.
 *
 * Body:
 *   { assessor_code: string, role?: "LEAD"|"MEMBER", weight?: number }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { assessor_code, role = "MEMBER", weight, assigned_by } = body;

    if (!assessor_code) {
      return NextResponse.json({ error: "assessor_code wajib diisi." }, { status: 400 });
    }

    // Validate session exists
    const { data: session, error: sessErr } = await supabase
      .from("exam_sessions")
      .select("id, certification_field, status")
      .eq("id", sessionId)
      .single();

    if (sessErr || !session) {
      return NextResponse.json({ error: "Sesi ujian tidak ditemukan." }, { status: 404 });
    }

    // Determine weight: LEAD default 2, MEMBER default 1
    const resolvedWeight = weight ?? (role === "LEAD" ? 2.0 : 1.0);

    // Check assessor exists in registry (optional — allow unknown assessors via code)
    const { data: assessorRecord } = await supabase
      .from("assessors")
      .select("id, name, qualification_status")
      .eq("assessor_code", assessor_code)
      .maybeSingle();

    if (assessorRecord && assessorRecord.qualification_status !== "APPROVED") {
      return NextResponse.json(
        { error: `Asesor ${assessor_code} belum APPROVED (status: ${assessorRecord.qualification_status}). Hanya asesor APPROVED yang dapat ditugaskan.` },
        { status: 403 }
      );
    }

    const { data: assignment, error: assignErr } = await supabase
      .from("assessor_assignments")
      .insert({
        exam_session_id: sessionId,
        assessor_id: assessorRecord?.id || null,
        assessor_code,
        role: role.toUpperCase(),
        weight: resolvedWeight,
      })
      .select()
      .single();

    if (assignErr) {
      if (assignErr.code === "23505") {
        return NextResponse.json({ error: `Asesor ${assessor_code} sudah ditugaskan ke sesi ini.` }, { status: 409 });
      }
      return NextResponse.json({ error: assignErr.message }, { status: 500 });
    }

    // Audit log
    await supabase.from("certification_audit_logs").insert({
      entity_type: "exam_session",
      entity_id: sessionId,
      action: "PANEL_ASSESSOR_ASSIGNED",
      performed_by: assigned_by || "Admin",
      new_value: {
        assessor_code,
        role: role.toUpperCase(),
        weight: resolvedWeight,
        certification_field: session.certification_field,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Asesor ${assessor_code} (${role}) berhasil ditugaskan ke panel.`,
      data: assignment,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/certifications/exam/sessions/[sessionId]/assign?assessor_code=
 * Admin mencabut penugasan asesor dari panel (hanya jika belum submit).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const { searchParams } = new URL(req.url);
  const assessorCode = searchParams.get("assessor_code");

  if (!assessorCode) return NextResponse.json({ error: "assessor_code wajib disertakan." }, { status: 400 });

  // Cannot remove if already submitted
  const { data: existing } = await supabase
    .from("assessor_assignments")
    .select("submitted_at")
    .eq("exam_session_id", sessionId)
    .eq("assessor_code", assessorCode)
    .single();

  if (existing?.submitted_at) {
    return NextResponse.json({ error: "Tidak dapat mencabut penugasan asesor yang sudah submit penilaian." }, { status: 409 });
  }

  const { error } = await supabase
    .from("assessor_assignments")
    .delete()
    .eq("exam_session_id", sessionId)
    .eq("assessor_code", assessorCode);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: `Penugasan asesor ${assessorCode} dicabut.` });
}
