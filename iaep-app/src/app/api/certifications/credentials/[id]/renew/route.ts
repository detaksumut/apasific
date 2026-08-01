import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EXPIRY_WINDOW_DAYS = 30; // credential dianggap "EXPIRING" jika dalam 30 hari

/**
 * GET /api/certifications/credentials/[id]/renew
 * Cek apakah credential eligible untuk renewal dan status renewal saat ini.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: credential, error } = await supabase
    .from("credentials")
    .select("id, credential_number, certification_type, status, expired_at, renewal_status, renewal_count, renewal_requested_at")
    .eq("id", id)
    .single();

  if (error || !credential) {
    return NextResponse.json({ error: "Credential tidak ditemukan." }, { status: 404 });
  }

  // Hitung EXPIRING secara calculated (bukan DB status)
  const now = new Date();
  const expiredAt = new Date(credential.expired_at);
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + EXPIRY_WINDOW_DAYS);

  const isExpiring = credential.status === "ACTIVE" && expiredAt > now && expiredAt <= windowEnd;
  const isExpired  = credential.status === "ACTIVE" && expiredAt <= now;

  const eligibleForRenewal =
    (credential.status === "ACTIVE" || isExpiring || credential.status === "EXPIRED") &&
    credential.status !== "REVOKED" &&
    credential.renewal_status === "NONE";

  const daysUntilExpiry = Math.ceil((expiredAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    credential,
    computed: {
      is_expiring: isExpiring,
      is_expired: isExpired,
      days_until_expiry: daysUntilExpiry,
      eligible_for_renewal: eligibleForRenewal,
    },
  });
}

/**
 * POST /api/certifications/credentials/[id]/renew
 * Kandidat mengajukan renewal. Admin kemudian APPROVE/REJECT.
 *
 * Body: { requested_by: string, reason?: string }
 *
 * Workflow:
 *   REQUESTED → Admin APPROVE → Buat exam_session baru → COMPLETED
 *   REQUESTED → Admin REJECT  → renewal_status = REJECTED
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { requested_by, reason, action, new_session_id } = body;

    const { data: credential, error } = await supabase
      .from("credentials")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !credential) {
      return NextResponse.json({ error: "Credential tidak ditemukan." }, { status: 404 });
    }

    if (credential.status === "REVOKED") {
      return NextResponse.json({ error: "Credential yang dicabut tidak dapat diperpanjang." }, { status: 403 });
    }

    // ── ACTION: REQUEST (candidate mengajukan) ──
    if (!action || action === "REQUEST") {
      if (credential.renewal_status !== "NONE") {
        return NextResponse.json(
          { error: `Renewal sudah dalam status: ${credential.renewal_status}. Tidak dapat mengajukan ulang.` },
          { status: 409 }
        );
      }

      const { data: updated, error: updateErr } = await supabase
        .from("credentials")
        .update({
          renewal_status: "REQUESTED",
          renewal_requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

      await supabase.from("certification_audit_logs").insert({
        entity_type: "credential",
        entity_id: id,
        action: "RENEWAL_REQUESTED",
        performed_by: requested_by || "Candidate",
        new_value: { renewal_status: "REQUESTED", reason: reason || null },
      });

      return NextResponse.json({
        success: true,
        message: "Permintaan renewal berhasil diajukan. Menunggu persetujuan Admin.",
        data: updated,
      });
    }

    // ── ACTION: APPROVE (admin menyetujui → buat exam session baru) ──
    if (action === "APPROVE") {
      if (credential.renewal_status !== "REQUESTED") {
        return NextResponse.json({ error: "Hanya credential dengan status REQUESTED yang dapat disetujui." }, { status: 400 });
      }

      // Fetch candidate info from original exam session
      let candidateId = credential.candidate_id;

      // Buat exam session baru untuk re-assessment
      const { data: newSession, error: sessErr } = await supabase
        .from("exam_sessions")
        .insert({
          candidate_id: candidateId,
          certification_field: credential.certification_type,
          status: "DRAFT",
          assessor_code: null,
          candidate_code: null,
        })
        .select()
        .single();

      if (sessErr) return NextResponse.json({ error: "Gagal membuat sesi ujian baru: " + sessErr.message }, { status: 500 });

      // Update renewal_status → APPROVED, link ke session baru
      const { data: updated, error: updateErr } = await supabase
        .from("credentials")
        .update({
          renewal_status: "APPROVED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

      await supabase.from("certification_audit_logs").insert({
        entity_type: "credential",
        entity_id: id,
        action: "RENEWAL_APPROVED",
        performed_by: requested_by || "Admin",
        new_value: {
          renewal_status: "APPROVED",
          new_exam_session_id: newSession.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Renewal disetujui. Sesi ujian baru telah dibuat.",
        data: updated,
        new_exam_session: { id: newSession.id, status: newSession.status },
      });
    }

    // ── ACTION: REJECT (admin menolak) ──
    if (action === "REJECT") {
      if (credential.renewal_status !== "REQUESTED") {
        return NextResponse.json({ error: "Hanya credential dengan status REQUESTED yang dapat ditolak." }, { status: 400 });
      }

      const { data: updated, error: updateErr } = await supabase
        .from("credentials")
        .update({
          renewal_status: "REJECTED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

      await supabase.from("certification_audit_logs").insert({
        entity_type: "credential",
        entity_id: id,
        action: "RENEWAL_REJECTED",
        performed_by: requested_by || "Admin",
        new_value: { renewal_status: "REJECTED", reason: reason || null },
      });

      return NextResponse.json({
        success: true,
        message: "Renewal ditolak.",
        data: updated,
      });
    }

    // ── ACTION: COMPLETE (setelah re-certification selesai) ──
    if (action === "COMPLETE") {
      if (credential.renewal_status !== "APPROVED") {
        return NextResponse.json({ error: "Hanya credential APPROVED yang dapat diselesaikan." }, { status: 400 });
      }

      // Mark old credential as EXPIRED
      await supabase
        .from("credentials")
        .update({
          status: "EXPIRED",
          renewal_status: "COMPLETED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      // New credential is issued via normal /credentials POST with renewed_from=id
      await supabase.from("certification_audit_logs").insert({
        entity_type: "credential",
        entity_id: id,
        action: "RENEWAL_COMPLETED",
        performed_by: requested_by || "Admin",
        new_value: {
          renewal_status: "COMPLETED",
          old_credential_expired: true,
          new_credential_id: new_session_id || null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Renewal selesai. Credential lama sudah expired.",
      });
    }

    return NextResponse.json({ error: `Action tidak dikenal: ${action}` }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
