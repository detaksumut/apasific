import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/certifications/credentials
 * Issue a new credential for a CERTIFIED candidate.
 *
 * Body: { exam_session_id, candidate_id, certification_type, issued_by?, valid_years? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exam_session_id, candidate_id, certification_type, issued_by, valid_years = 3 } = body;

    if (!exam_session_id || !candidate_id || !certification_type) {
      return NextResponse.json(
        { error: "exam_session_id, candidate_id, certification_type wajib diisi." },
        { status: 400 }
      );
    }

    // Validate exam session is ASSESSMENT_COMPLETED or CERTIFIED
    const { data: session, error: sessErr } = await supabase
      .from("exam_sessions")
      .select("status, certification_field")
      .eq("id", exam_session_id)
      .single();

    if (sessErr || !session) {
      return NextResponse.json({ error: "Sesi ujian tidak ditemukan." }, { status: 404 });
    }

    if (!["ASSESSMENT_COMPLETED", "CERTIFIED"].includes(session.status)) {
      return NextResponse.json(
        { error: `Credential hanya dapat diterbitkan untuk sesi ASSESSMENT_COMPLETED atau CERTIFIED. Status saat ini: ${session.status}` },
        { status: 400 }
      );
    }

    // Generate identifiers
    const year = new Date().getFullYear();
    const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
    const credential_number = `APASIFIC-CERT-${year}-${suffix}`;
    const verification_token = randomUUID().replace(/-/g, "").toUpperCase();
    const credentialId = `CRED-${suffix}`;

    const issued_at = new Date();
    const expired_at = new Date(issued_at);
    expired_at.setFullYear(expired_at.getFullYear() + Number(valid_years));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apasific.org";
    const verification_url = `${appUrl}/verify/${verification_token}`;

    // Insert credential
    const { data: credential, error: credErr } = await supabase
      .from("credentials")
      .insert({
        id: credentialId,
        candidate_id,
        exam_session_id,
        credential_number,
        certification_type,
        verification_token,
        verification_url,
        issued_by: issued_by || "APASIFIC Admin",
        issued_at: issued_at.toISOString(),
        expired_at: expired_at.toISOString(),
        status: "ACTIVE",
      })
      .select()
      .single();

    if (credErr) {
      return NextResponse.json({ error: "Gagal menerbitkan credential: " + credErr.message }, { status: 500 });
    }

    // Update exam_session status → CERTIFIED
    await supabase
      .from("exam_sessions")
      .update({ status: "CERTIFIED", completed_at: issued_at.toISOString(), updated_at: new Date().toISOString() })
      .eq("id", exam_session_id);

    // Audit log
    await supabase.from("certification_audit_logs").insert({
      entity_type: "credential",
      entity_id: credentialId,
      action: "CREDENTIAL_ISSUED",
      performed_by: `Admin:${issued_by || "Unknown"}`,
      new_value: { credential_number, candidate_id, certification_type, verification_url, expired_at: expired_at.toISOString() },
    });

    return NextResponse.json({ success: true, message: "Sertifikat berhasil diterbitkan.", credential });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/certifications/credentials?candidate_id=xxx
 * List all credentials for a candidate (admin use).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const candidate_id = searchParams.get("candidate_id");

  if (!candidate_id) {
    return NextResponse.json({ error: "candidate_id wajib disertakan." }, { status: 400 });
  }

  // Auto-mark expired credentials
  await supabase
    .from("credentials")
    .update({ status: "EXPIRED", updated_at: new Date().toISOString() })
    .eq("candidate_id", candidate_id)
    .eq("status", "ACTIVE")
    .lt("expired_at", new Date().toISOString());

  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("candidate_id", candidate_id)
    .order("issued_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * PATCH /api/certifications/credentials?id=CRED-XXXXXX
 * Revoke a credential.
 *
 * Body: { revoked_reason, revoked_by }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id wajib disertakan." }, { status: 400 });

    const body = await req.json();
    const { revoked_reason, revoked_by } = body;

    const { data, error } = await supabase
      .from("credentials")
      .update({
        status: "REVOKED",
        revoked_at: new Date().toISOString(),
        revoked_reason: revoked_reason || "Revoked by admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Audit log
    await supabase.from("certification_audit_logs").insert({
      entity_type: "credential",
      entity_id: id,
      action: "CREDENTIAL_REVOKED",
      performed_by: `Admin:${revoked_by || "Unknown"}`,
      new_value: { status: "REVOKED", revoked_reason },
    });

    return NextResponse.json({ success: true, message: "Credential berhasil direvoke.", data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
